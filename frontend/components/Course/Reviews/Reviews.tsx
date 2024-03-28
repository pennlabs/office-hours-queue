import { Segment, Grid, Table, Pagination, Rating } from "semantic-ui-react";
// import { useCourse } from "../../../hooks/data-fetching/course";
import { useContext } from "react";
import ReviewsForm from "./ReviewsForm";
import { Course, /* User, */ Membership } from "../../../types";
import { AuthUserContext } from "../../../context/auth";
// import { ReviewListResult, ReviewsOrderBy, useReviews} from "../../../hooks/data-fetching/tareviews";
import data from "./reviews_data.json";

const MAX_QUESTIONS_PER_PAGE = 20;
interface ReviewProps {
    course: Course;
    leadership: Membership[];
    /* reviewListResult: ReviewListResult; */
}

const Reviews = (props: ReviewProps) => {
    const {
        course: rawCourse,
        leadership: rawLeadership /* reviewListResult */,
    } = props;
    // const { data: course } = useCourse(rawCourse.id, rawCourse);

    // const getFullName = (user: User) => `${user.firstName} ${user.lastName}`;

    // const { data, updateFilter, filters, downloadUrl } = useReviews(
    //     course!.id,
    //     reviewListResult
    // );

    const { user: initialUser } = useContext(AuthUserContext);
    if (!initialUser) {
        throw new Error(
            "Invariant broken, withAuth must be used with component"
        );
    }

    const professor = initialUser.membershipSet.some(
        ({ id, course, kind }) =>
            course.id === rawCourse.id && kind === "PROFESSOR"
    );

    return (
        <div>
            <Grid.Row>
                <Segment basic>
                    <ReviewsForm
                        courseId={rawCourse.id}
                        leadership={rawLeadership}
                    />
                    {/* Average Rating: {0} <Rating icon = "star" rating = {1} disabled/> */}
                    {professor && (
                        <Table sortable celled padded striped>
                            <Table.Header>
                                <Table.Row>
                                    <Table.HeaderCell width={2}>
                                        Instructor
                                    </Table.HeaderCell>
                                    <Table.HeaderCell width={4}>
                                        Question
                                    </Table.HeaderCell>
                                    <Table.HeaderCell width={3}>
                                        Feedback
                                    </Table.HeaderCell>
                                    <Table.HeaderCell width={1}>
                                        Rating
                                    </Table.HeaderCell>
                                </Table.Row>
                            </Table.Header>
                            {data && data.results && (
                                <Table.Body>
                                    {data.results.map(
                                        ({
                                            rating,
                                            content,
                                            question /* timeUpdated */,
                                        }) => (
                                            <Table.Row key={question.id}>
                                                <Table.Cell>
                                                    {
                                                        question.respondedToBy &&
                                                            `${question.respondedToBy.firstName} ${question.respondedToBy.lastName}` // change this when API works
                                                    }
                                                </Table.Cell>
                                                <Table.Cell>
                                                    {question.text}
                                                </Table.Cell>
                                                <Table.Cell>
                                                    {content}
                                                </Table.Cell>
                                                <Table.Cell>
                                                    <Rating
                                                        icon="star"
                                                        maxRating={5}
                                                        rating={rating}
                                                        disabled
                                                    />
                                                </Table.Cell>
                                            </Table.Row>
                                        )
                                    )}
                                </Table.Body>
                            )}
                            <Table.Footer>
                                {data && (
                                    <Table.Row textAlign="right">
                                        <Table.HeaderCell colSpan="6">
                                            <Pagination
                                                // activePage={filters.page}
                                                totalPages={Math.max(
                                                    1,
                                                    Math.ceil(
                                                        data.count /
                                                            MAX_QUESTIONS_PER_PAGE
                                                    )
                                                )}
                                                // onPageChange={(
                                                //     _,
                                                //     { activePage }
                                                // ) => {
                                                //     let parsedPage: number;
                                                //     if (
                                                //         typeof activePage ===
                                                //         "string"
                                                //     ) {
                                                //         parsedPage = parseInt(
                                                //             activePage,
                                                //             10
                                                //         );
                                                //     } else if (
                                                //         typeof activePage ===
                                                //         "number"
                                                //     ) {
                                                //         parsedPage = activePage;
                                                //     } else {
                                                //         parsedPage = 1;
                                                //     }

                                                //     // updateFilter({
                                                //     //     page: parsedPage,
                                                //     // });
                                                // }}
                                            />
                                        </Table.HeaderCell>
                                    </Table.Row>
                                )}
                            </Table.Footer>
                        </Table>
                    )}
                    <div>
                        {data &&
                            `${data.count} review${
                                data.count === 1 ? "" : "s"
                            }`}
                    </div>
                </Segment>
            </Grid.Row>
        </div>
    );
};

export default Reviews;
