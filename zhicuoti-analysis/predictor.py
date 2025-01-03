import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.multioutput import MultiOutputClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import hamming_loss
from sklearn.utils import shuffle
from sklearn.ensemble import RandomForestClassifier
import matplotlib.pyplot as plt
import jieba
from typing import Literal
from sklearn.model_selection import GridSearchCV
from sklearn.pipeline import Pipeline


class Predictor:
    """Predictor class for predicting tags of problem(s)."""

    def __init__(
        self, data_path: str = "./data/MATH-6-tags.csv", cut_words: bool = True
    ):
        """Predictor class for predicting tags of problem(s).

        Args:
            data_path (str, optional): The data path used to train the model. Defaults to "./data/MATH-6-tags.csv".
            cut_words (bool, optional): Whether or not to tokenize Chinese words before training. Defaults to True.
        """
        self.df = pd.read_csv(data_path)
        self.X = self.df["contentPlain"].values.astype("U")
        if cut_words:  # enable jieba, can greatly increase the performance
            for idx, content in enumerate(self.X):
                self.X[idx] = " ".join(jieba.cut(content))
        self.y = np.asarray(self.df[self.df.columns[1:]])
        self.clf = self.vectorizer = None

    def model_cv(self):
        """Run cross-validation to find the best hyperparameters for the model."""
        X_train, X_test, y_train, y_test = train_test_split(
            self.X, self.y, test_size=0.01, random_state=42
        )
        X_train_shuffle, y_train_shuffle = shuffle(X_train, y_train)
        pipeline = Pipeline(
            steps=[
                (
                    "vectorizer",
                    TfidfVectorizer(
                        max_features=2500, max_df=0.9, token_pattern=r"(?u)\b\w+\b"
                    ),
                ),
                (
                    "clf",
                    MultiOutputClassifier(
                        RandomForestClassifier(
                            random_state=42, n_estimators=150, max_depth=49
                        ),
                        n_jobs=-1,
                    ),
                ),
            ]
        )
        param_test = {
            "clf__estimator__max_depth": range(90, 110, 2),
        }

        # TODO: find out why `make_scorer` is not working
        def scorer(estimator, X, y):
            y_pred = estimator.predict_proba(X)
            binary_predictions = np.array(
                [1 - proba[:, 0] > 0.5 for proba in list(y_pred)]
            ).T
            loss = hamming_loss(y, binary_predictions)
            # IMPORTANT: The lower the loss, the better the model
            return -loss

        model = GridSearchCV(
            estimator=pipeline, param_grid=param_test, cv=5, n_jobs=-1, scoring=scorer
        )
        model.fit(X_train_shuffle, y_train_shuffle)
        print(model.best_score_, model.best_params_)
        return model.best_score_, model.best_params_

    def train_model(
        self,
        train_size: float | int | None = None,
        algorithm: Literal["logistic", "random-forest"] = "random-forest",
    ):
        """Train the model with the given algorithm.

        Args:
            train_size (float | int | None, optional): Dataset size used for training. 90% of whole dataset if None is given. Defaults to None.
            algorithm (Literal["logistic", "random-forest"], optional): Algorithm used with the model. Defaults to "random-forest".

        Returns:
            Tuple[np.array, np.array]: X_test and y_test for testing the model.
        """
        if train_size is None:
            train_size = 0.9
        X_train, X_test, y_train, y_test = train_test_split(
            self.X, self.y, random_state=42, train_size=train_size
        )
        X_train_shuffle, y_train_shuffle = shuffle(X_train, y_train)
        self.vectorizer = TfidfVectorizer(
            max_features=2500, max_df=0.9, token_pattern=r"(?u)\b\w+\b"
        )
        self.vectorizer.fit(self.X)
        X_train_tfidf = self.vectorizer.transform(X_train_shuffle)
        if algorithm == "logistic":
            estimator = LogisticRegression()
        else:
            estimator = RandomForestClassifier(
                n_estimators=150, random_state=42, n_jobs=-1
            )
        self.clf = MultiOutputClassifier(estimator, n_jobs=-1).fit(
            X_train_tfidf, y_train_shuffle
        )
        return X_test, y_test

    def predict_prob(self, X_test: np.ndarray):
        """Predict the probability of each tag for the given problem(s).

        Args:
            X_test (np.ndarray): The problem(s) to predict.

        Returns:
            ndarray | list[ndarray]: The probability of each tag for the given problem(s).
        """
        X_test_tfidf = self.vectorizer.transform(X_test)
        prediction = self.clf.predict_proba(X_test_tfidf)
        return prediction

    def predict_binary(self, X_test: np.ndarray, threshold: float = 0.5):
        """Predict the binary result of each tag for the given problem(s).

        Args:
            X_test (np.ndarray): The problem(s) to predict.
            threshold (float, optional): Probability threshold for the result being True. Defaults to 0.5.

        Returns:
            ndarray[bool]: The binary result of each tag for the given problem(s).
        """
        prediction_prob = self.predict_prob(X_test)
        binary_predictions = np.array(
            [proba[:, 1] > threshold for proba in prediction_prob]
        ).T
        return binary_predictions

    def hamming_loss(self, y_test: np.ndarray, binary_prediction: np.ndarray):
        """Calculate the hamming loss of the prediction.

        Args:
            y_test (np.ndarray): The true labels.
            binary_prediction (np.ndarray): The binary prediction.

        Returns:
            float: The hamming loss of the prediction.
        """
        return hamming_loss(y_test, binary_prediction)

    def predict_tags(self, X_test: np.ndarray, max_tags: int = np.inf):
        """Predict the tags of the given problem(s).

        Args:
            X_test (np.ndarray): The problem(s) to predict.
            max_tags (int, optional): Maximum tags to predict. Defaults to np.inf.

        Returns:
            dict[str, list[str]]: The predicted tags of the given problem(s).
        """
        prediction = self.predict_prob(X_test)
        prob = np.array(prediction)[:, :, 1].T
        result = {}
        for problem, content in zip(prob, X_test):
            tag_prob = []
            for idx, tag in enumerate(self.df.columns[1:]):
                if problem[idx] == 0.0:
                    continue
                tag_prob.append((tag, float(round(problem[idx], 5))))
            tag_prob = sorted(tag_prob, key=lambda x: x[1], reverse=True)
            result[content] = (
                tag_prob[:max_tags] if len(tag_prob) > max_tags else tag_prob
            )
        return result


def test_model():
    max_values = [2800, 3100, 3400, 3700, 4000, 4300, 4600, 4900, 5200, 5500]
    predictor = Predictor()
    total_loss_logistic = []
    total_loss_random_forest = []
    for val in max_values:
        X_test, y_test = predictor.train_model(val, "logistic")
        loss = predictor.hamming_loss(y_test, predictor.predict_binary(X_test))
        total_loss_logistic.append(loss)
        print(f"Logistic regression with {val} records: {loss}")
        X_test, y_test = predictor.train_model(val, "random-forest")
        loss = predictor.hamming_loss(y_test, predictor.predict_binary(X_test))
        total_loss_random_forest.append(loss)
        print(f"Random forest with {val} records: {loss}")
    total_loss_random_forest_without_jieba = []
    predictor_without_jieba = Predictor(cut_words=False)
    for val in max_values:
        X_test, y_test = predictor_without_jieba.train_model(val, "random-forest")
        loss = predictor.hamming_loss(
            y_test, predictor_without_jieba.predict_binary(X_test)
        )
        total_loss_random_forest_without_jieba.append(loss)
        print(f"Random forest with {val} records, without jieba: {loss}")
    plt.figure(figsize=(15, 10))
    plt.title("Hamming loss vs. Number of records")
    plt.plot(max_values, total_loss_random_forest, label="Random forest")
    plt.plot(max_values, total_loss_logistic, label="Logistic regression")
    plt.plot(
        max_values,
        total_loss_random_forest_without_jieba,
        label="Random forest without jieba",
    )
    plt.legend()
    plt.xlabel("Number of records")
    plt.ylabel("Hamming loss")
    plt.savefig("hamming-loss-with-jieba.png")


def generate_heatmap(prediction):
    prediction = np.array(prediction)[:, :, 1].T[:10]
    fig, ax = plt.subplots(figsize=(20, 8))
    im = ax.imshow(prediction, cmap="Blues")
    ax.grid(axis="y")
    ax.set_xticklabels([])
    ax.set_yticks(np.arange(prediction.shape[0]))
    plt.ylabel("Records", fontsize="xx-large")
    plt.xlabel("Classes", fontsize="xx-large")
    fig.colorbar(im, ax=ax, fraction=0.046, pad=0.04)

    for i in range(prediction.shape[0]):
        for j in range(21):
            if prediction[i, j] > 0.1:
                ax.text(j, i, j, ha="center", va="center", color="w", fontsize=30)

    plt.savefig("heatmap.png")
