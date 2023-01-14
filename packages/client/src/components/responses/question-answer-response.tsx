import { Fragment, useContext, useState } from "react";

import { apiReplyAnswerQuestion } from "../../api/api";
import { AuthContext } from "../../context";
import { getIconSVG } from "../../utils/icons";
import { StatusMessage } from "../main-container";
import { ResponseFeedback } from "../response-feedback";
import { responseToArrayWithKeywords } from "./keyword";

interface IProps {
    canUseToolbox: boolean;
    onSubmitFeedback: () => void;
    data: {
        question: string;
        answer: string;
        id: string;
        query: string;
        followUps: Array<{
            time: Date;
            query: string;
            id: string;
            question: string;
            answer: string;
        }>;
        feedback?: {
            reason: string;
            rating: number;
        };
    };
}

export const QuestionAnswerResponse = (props: IProps) => {
    const { context } = useContext(AuthContext);
    const [status, setStatus] = useState<StatusMessage>(StatusMessage.OK);

    const [followUps, setFollowUps] = useState<
        Array<{
            time: Date;
            query: string;
            id: string;
            question: string;
            answer: string;
        }>
    >(props.data.followUps || []);
    const [followUpQuestion, setFollowUpQuestion] = useState<string>("");

    return (
        <div className="question-answer-main-container">
            <div className="main-question">
                <Fragment>
                    {getIconSVG("question", "response-header-icon")}
                    {props.data.question}
                </Fragment>
            </div>
            <div className="question-answer-main-content">
                <div>
                    <Fragment>
                        {responseToArrayWithKeywords(props.data.answer).map(
                            (item: string | JSX.Element, index: number) => {
                                if (typeof item === "string") {
                                    return (
                                        <span key={"txt-" + index}>{item}</span>
                                    );
                                }

                                return item;
                            }
                        )}
                    </Fragment>
                </div>
                <div className="follow-up-responses">
                    {followUps.map((f) => {
                        return (
                            <div key={f.id}>
                                <div className="follow-up-question">
                                    <div>
                                        {getIconSVG(
                                            "question",
                                            "response-header-icon"
                                        )}
                                    </div>
                                    {f.question}
                                </div>
                                <div className="follow-up-answer">
                                    <Fragment>
                                        {responseToArrayWithKeywords(
                                            f.answer
                                        ).map(
                                            (
                                                item: string | JSX.Element,
                                                index: number
                                            ) => {
                                                if (typeof item === "string") {
                                                    return (
                                                        <span
                                                            key={"txt-" + index}
                                                        >
                                                            {item}
                                                        </span>
                                                    );
                                                }

                                                return item;
                                            }
                                        )}
                                    </Fragment>
                                </div>

                                <ResponseFeedback
                                    responseId={props.data.id}
                                    followUpId={f.id}
                                    onSubmitFeedback={props.onSubmitFeedback}
                                />
                            </div>
                        );
                    })}
                </div>

                <div className="follow-up-question-input-container">
                    <textarea
                        placeholder="follow up question..."
                        className="follow-up-question-input"
                        onChange={(e) => {
                            setFollowUpQuestion(e.target.value);
                        }}
                        value={followUpQuestion}
                    ></textarea>

                    <button
                        disabled={props.canUseToolbox ? false : true}
                        className="follow-up-question-button"
                        onClick={() => {
                            let prevQuestions =
                                followUps.length > 0
                                    ? followUps[followUps.length - 1].query
                                    : props.data.query;

                            if (followUpQuestion === "") {
                                setStatus(StatusMessage.QuestionEmpty);

                                return;
                            }

                            setStatus(StatusMessage.Loading);

                            apiReplyAnswerQuestion(
                                context?.token,
                                props.data.id,
                                prevQuestions,
                                followUpQuestion
                            )
                                .then(async (res) => {
                                    const data = await res.json();

                                    setFollowUps([...followUps, { ...data }]);
                                    setStatus(StatusMessage.OK);
                                })
                                .catch(() => {
                                    setStatus(StatusMessage.Failed);
                                });
                        }}
                    >
                        ask
                    </button>
                </div>

                <div>{status !== StatusMessage.OK ? status : null}</div>

                <ResponseFeedback
                    priorData={props.data.feedback}
                    responseId={props.data.id}
                    onSubmitFeedback={props.onSubmitFeedback}
                />
            </div>
        </div>
    );
};
