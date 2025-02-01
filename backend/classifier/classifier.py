import jieba
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics import (
    accuracy_score,
    f1_score,
    hamming_loss,
    precision_score,
    recall_score,
)
from sklearn.model_selection import train_test_split
from sklearn.utils import shuffle


class ProblemClassifier:
    """Classify problems into corresponding subjects."""

    def __init__(
        self,
        data_path: str = "./data/classifier/data.csv",
        cut_words: bool = True,
        stopwords: str = "./data/stopwords.txt",
        token_pattern: str = r"(?u)\b\w+\b",
    ):
        """Initialize the classifier.

        Args:
            data_path (str, optional): The data path used to train the model.
                                       Defaults to "./data/classifier/data.csv".
            cut_words (bool, optional): Whether or not to tokenize Chinese words before training.
                                        Defaults to True.
            stopwords (str, optional): The stopwords file path.
                                        Defaults to "./data/stopwords.txt".
            token_pattern (str, optional): The token pattern used for tokenization.
                                           Defaults to r"(?u)\b\w+\b".
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

    def train_model(
        self,
        train_size: float | int | None = None,
    ):
        """Train the model.

        Args:
            train_size (float | int | None, optional): Dataset size used for training. 90% of whole dataset if None is given.
                                                       Defaults to None.

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

        self.clf = RandomForestClassifier(
            n_estimators=350, random_state=42, n_jobs=-1, max_depth=1500
        )
        self.clf.fit(X_train_tfidf, y_train_shuffle)
        return X_test, y_test

    def predict_proba(self, X_test: np.ndarray):
        """Predict the probability of each subject for the given problem(s).

        Args:
            X_test (np.ndarray): The problem(s) to predict.

        Returns:
            ndarray | list[ndarray]: The probability of each subject for the given problem(s).
        """
        if self.should_cut_words:
            for idx, content in enumerate(X_test):
                X_test[idx] = self._cut_words(content)
        X_test_tfidf = self.vectorizer.transform(X_test)
        prediction = self.clf.predict_proba(X_test_tfidf)
        return prediction

    def predict_binary(self, X_test: np.ndarray):
        """Predict the binary value of each subject for the given problem(s).

        Args:
            X_test (np.ndarray): The problem(s) to predict.

        Returns:
            ndarray | list[ndarray]: The binary value of each subject for the given problem(s).
        """
        if self.should_cut_words:
            for idx, content in enumerate(X_test):
                X_test[idx] = self._cut_words(content)
        X_test_tfidf = self.vectorizer.transform(X_test)
        prediction = self.clf.predict(X_test_tfidf)
        return prediction

    def predict(self, X_test: np.ndarray):
        """Predict the subject for the given problem(s).

        Args:
            X_test (np.ndarray): The problem(s) to predict.

        Returns:
            ndarray | list[ndarray]: The predicted subject for the given problem(s).
        """
        prediction = self.predict_binary(X_test)
        results = []
        for pred in prediction:
            for idx, subject in enumerate(self.df.columns[1:]):
                if pred[idx] == 1:
                    results.append(subject)
        return results

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


# driver code
if __name__ == "__main__":
    classifier = ProblemClassifier("./data/classifier/data.csv")
    X_test_driver, y_test_driver = classifier.train_model(0.95)
    t = "3.下列关于脂质的叙述(正确的是(A.脂质只含有 C、H、O 三种元素人出B.胆固醇能促进人体肠道对钙和磷的吸收火C,脂肪只存在于动物细胞中,植物细胞中没有D.海豹的皮下脂肪有减少热量散失,保温的作用"
    print(classifier.predict([t]))
    # metrics = classifier.generate_metrics(
    #     y_test_driver, classifier.predict_binary(X_test_driver)
    # )
    # print(metrics)
    # joblib.dump(classifier, "./data/pre-trained/ZCT-Classifier-2.pkl")
