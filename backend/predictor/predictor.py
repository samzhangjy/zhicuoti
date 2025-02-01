from typing import Literal

import jieba
import joblib
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    f1_score,
    hamming_loss,
    precision_score,
    recall_score,
)
from sklearn.model_selection import GridSearchCV, train_test_split
from sklearn.multioutput import MultiOutputClassifier
from sklearn.pipeline import Pipeline
from sklearn.utils import shuffle


class ProblemPredictor:
    """Predictor class for predicting tags of problem(s)."""

    def __init__(
        self,
        data_path: str = "./data/predictor/MATH-processed.csv",
        cut_words: bool = True,
        stopwords: str = "./data/stopwords.txt",
        token_pattern: str = r"(?u)\b\w+\b",
    ):
        """Predictor class for predicting tags of problem(s).

        Args:
            data_path (str, optional): The data path used to train the model.
                                       Defaults to "./data/predictor/MATH-processed.csv".
            cut_words (bool, optional): Whether or not to tokenize Chinese words before training.
                                        Defaults to True.
        """
        self.df = pd.read_csv(data_path)
        self.X = self.df["contentPlain"].values.astype("U")
        self.should_cut_words = cut_words
        if cut_words:  # enable jieba, can greatly increase the performance
            for idx, content in enumerate(self.X):
                self.X[idx] = self._cut_words(content)
        self.y = np.asarray(self.df[self.df.columns[1:]])
        self.clf = self.vectorizer = None
        with open(stopwords, "r", encoding="utf-8") as f:
            self.stopwords = [i.strip() for i in f.readlines()]
        self.token_pattern = token_pattern

    def _cut_words(self, x: str):
        CHN_PUNCATIONS = [
            "“",
            "”",
            "（",
            "）",
            "，",
            "、",
            "：",
            "；",
            "。",
            "《",
            "》",
            "【",
            "】",
        ]
        ASCII_PUNCATIONS = ["(", ")", ",", "=", "[", "]"]
        PUNCATIONS = CHN_PUNCATIONS + ASCII_PUNCATIONS
        curr = ""
        res = ""
        for s in x:
            if "\u0e00" <= s <= "\u9fa5" and s not in CHN_PUNCATIONS:
                curr += s
            else:
                if curr:
                    res += " " + " ".join(jieba.cut(curr)) + " "
                    curr = ""
                if s in PUNCATIONS:
                    s = " " + s + " "
                res += s
        return res

    def model_cv(self):
        """Run cross-validation to find the best hyperparameters for the model."""
        X_train, _, y_train, _ = train_test_split(
            self.X, self.y, test_size=0.01, random_state=42
        )
        X_train_shuffle, y_train_shuffle = shuffle(X_train, y_train)
        pipeline = Pipeline(
            steps=[
                (
                    "vectorizer",
                    TfidfVectorizer(
                        max_features=2500,
                        max_df=0.9,
                        token_pattern=self.token_pattern,
                        stop_words=self.stopwords,
                    ),
                ),
                (
                    "clf",
                    MultiOutputClassifier(
                        LogisticRegression(random_state=42),
                        n_jobs=-1,
                    ),
                ),
            ]
        )

        param_grid = {
            "clf__estimator__C": [0.001, 0.01, 0.1, 1, 10, 100, 1000],
            # 'clf__estimator__penalty': ['l1', 'l2'],
            # 'max_iter': list(range(100,800,100)),
        }

        # TODO: find out why `make_scorer` is not working
        def scorer(estimator, X, y):
            print(X.shape)
            y_pred = estimator.predict_proba(X)
            binary_predictions = np.array(
                [1 - proba[:, 0] > 0.5 for proba in list(y_pred)]
            ).T
            loss = hamming_loss(y, binary_predictions)
            # IMPORTANT: The lower the loss, the better the model
            return -loss

        model = GridSearchCV(
            estimator=pipeline, param_grid=param_grid, cv=5, n_jobs=-1, scoring=scorer
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
            train_size (float | int | None, optional): Dataset size used for training. 90% of whole dataset if None is given.
                                                       Defaults to None.
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
            max_features=2500,
            max_df=0.9,
            token_pattern=self.token_pattern,
            stop_words=self.stopwords,
        )
        self.vectorizer.fit(self.X)
        X_train_tfidf = self.vectorizer.transform(X_train_shuffle)
        if algorithm == "logistic":
            estimator = LogisticRegression(
                C=1.6,
                max_iter=10000,
                penalty="l2",
                solver="lbfgs",
                random_state=42,
                n_jobs=-1,
            )
        else:
            estimator = RandomForestClassifier(
                n_estimators=350, random_state=42, n_jobs=-1, max_depth=1500
            )
        self.clf = MultiOutputClassifier(estimator, n_jobs=-1).fit(
            X_train_tfidf, y_train_shuffle
        )
        return X_test, y_test

    def predict_proba(self, X_test: np.ndarray):
        """Predict the probability of each tag for the given problem(s).

        Args:
            X_test (np.ndarray): The problem(s) to predict.

        Returns:
            ndarray | list[ndarray]: The probability of each tag for the given problem(s).
        """
        if self.should_cut_words:
            for idx, content in enumerate(X_test):
                X_test[idx] = self._cut_words(content)
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
        prediction_prob = self.predict_proba(X_test)
        binary_predictions = np.array(
            # shape for each `proba` is (proba_0, proba_1)
            # in some extreme cases where none of the tags are predicted,
            # the shape will be (proba_0,)
            # so we need to check the shape of the `proba`
            [
                (proba[:, 1] if proba.shape[-1] > 1 else np.zeros(proba.shape[0]))
                > threshold
                for proba in prediction_prob
            ]
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

    def predict_problems(
        self, X_test: np.ndarray, max_tags: int = np.inf, min_proba: float = 0.5
    ):
        """Predict the tags of the given problem(s).

        Args:
            X_test (np.ndarray): The problem(s) to predict.
            max_tags (int, optional): Maximum tags to predict. Defaults to np.inf.
            min_proba (float, optional): Minimum probability to predict the tag. Defaults to 0.5.

        Returns:
            dict[str, list[str]]: The predicted tags of the given problem(s).
        """
        prediction = self.predict_proba(X_test)
        prob = np.array(prediction)[:, :, 1].T
        result = []
        for problem in prob:
            tag_prob = []
            for idx, tag in enumerate(self.df.columns[1:]):
                if problem[idx] == 0.0:
                    continue
                if problem[idx] < min_proba:
                    continue
                tag_prob.append((tag, float(round(problem[idx], 5))))
            tag_prob = sorted(tag_prob, key=lambda x: x[1], reverse=True)
            result.append(
                tag_prob[:max_tags] if len(tag_prob) > max_tags else tag_prob
            )
        return result

    def predict_problem(self, X_test: str, max_tags: int = np.inf):
        """Predict the tags of the given problem.

        Args:
            X_test (str): The problem to predict.
            max_tags (int, optional): Maximum tags to predict. Defaults to np.inf.

        Returns:
            list[str]: The predicted tags of the given problem.
        """
        return self.predict_problems(np.array(X_test), max_tags)[X_test]

    def generate_metrics(self, y_test: np.ndarray, binary_prediction: np.ndarray):
        """Generate metrics for the prediction.

        Args:
            y_test (np.ndarray): The true labels.
            binary_prediction (np.ndarray): The binary prediction.

        Returns:
            dict[str, float]: The metrics of the prediction.
        """

        metrics = {}
        metrics["accuracy"] = accuracy_score(y_test, binary_prediction)
        metrics["precision"] = precision_score(
            y_test, binary_prediction, average="micro"
        )
        metrics["recall"] = recall_score(y_test, binary_prediction, average="micro")
        metrics["f1"] = f1_score(y_test, binary_prediction, average="micro")
        metrics["hamming_loss"] = hamming_loss(y_test, binary_prediction)
        return metrics


def test_model(
    data_path: str,
    values: list = range(2800, 5501, 300),
    logistic: bool = True,
    no_jieba: bool = True,
):
    predictor = ProblemPredictor(data_path)
    total_loss_logistic = []
    total_loss_random_forest = []
    for val in values:
        if logistic:
            X_test, y_test = predictor.train_model(val, "logistic")
            loss = predictor.hamming_loss(y_test, predictor.predict_binary(X_test))
            total_loss_logistic.append(loss)
            print(f"Logistic regression with {val} records: {loss}")
        X_test, y_test = predictor.train_model(val, "random-forest")
        loss = predictor.hamming_loss(y_test, predictor.predict_binary(X_test))
        total_loss_random_forest.append(loss)
        print(f"Random forest with {val} records: {loss}")
    total_loss_random_forest_without_jieba = []
    if no_jieba:
        predictor_without_jieba = ProblemPredictor(data_path, cut_words=False)
        for val in values:
            X_test, y_test = predictor_without_jieba.train_model(val, "random-forest")
            loss = predictor.hamming_loss(
                y_test, predictor_without_jieba.predict_binary(X_test)
            )
            total_loss_random_forest_without_jieba.append(loss)
            print(f"Random forest with {val} records, without jieba: {loss}")
    plt.figure(figsize=(15, 10))
    plt.title("Hamming loss vs. Number of records")
    plt.plot(values, total_loss_random_forest, label="Random forest")
    if logistic:
        plt.plot(values, total_loss_logistic, label="Logistic regression")
    if no_jieba:
        plt.plot(
            values,
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


# driver code
if __name__ == "__main__":
    predictor = ProblemPredictor("./data/predictor/BIOLOGY-processed.csv")
    X_test, y_test = predictor.train_model(0.95, "random-forest")
    metrics = predictor.generate_metrics(y_test, predictor.predict_binary(X_test))
    print(metrics)
    joblib.dump(predictor, "./data/pre-trained/ZCT-Predictor-BIOLOGY.pkl")
