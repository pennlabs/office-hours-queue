import { useState } from "react";
import { Button, Form, Rating, TextArea } from "semantic-ui-react";

interface QuestionReviewInput {
    rating: number;
    review: String;
}
interface QuestionReviewProps {
    setReviewed: (reviewed: boolean) => void;
}
const QuestionReview = ({ setReviewed }: QuestionReviewProps) => {
    const [input, setInput] = useState<QuestionReviewInput>({
        rating: 0,
        review: "",
    });
    const canSubmit = () => {
        return (
            input.rating > 0 &&
            input.review.length > 0 &&
            input.review.length <= 1000
        );
    };
    const handleSubmit = () => {
        if (!canSubmit()) {
            return;
        }
        setReviewed(true);
    };
    return (
        <div>
            <Form>
                <Form.Field>
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "row",
                            gap: "1em",
                        }}
                    >
                        <div>How was your experience?</div>
                        <Rating
                            required
                            icon="star"
                            defaultRating={0}
                            maxRating={5}
                            size="huge"
                            onRate={(e, { rating }) =>
                                setInput({
                                    ...input,
                                    rating: rating as number,
                                })
                            }
                        />
                    </div>
                </Form.Field>
                <Form.Field>
                    <TextArea
                        id="review-text-area"
                        placeholder="Tell us more..."
                        onChange={(e) =>
                            setInput({ ...input, review: e.target.value })
                        }
                    />
                </Form.Field>
                <div
                    style={{
                        textAlign: "right",
                        fontSize: "0.8em",
                        color: input.review.length > 1000 ? "red" : "",
                    }}
                >
                    Characters: {input.review.length ?? 0}/1000
                </div>
                <Button
                    disabled={!canSubmit()}
                    type="submit"
                    color="green"
                    size="small"
                    onClick={() => handleSubmit()}
                >
                    Submit
                </Button>
            </Form>
        </div>
    );
};
export default QuestionReview;
