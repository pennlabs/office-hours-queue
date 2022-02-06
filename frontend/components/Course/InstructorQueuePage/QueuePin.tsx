import { useEffect, useRef, useState } from "react";
import { Button, Icon } from "semantic-ui-react";
import { mutateResourceListFunction } from "@pennlabs/rest-hooks/dist/types";
import { useMediaQuery } from "@material-ui/core";
import { Queue as QueueType } from "../../../types";
import { partialUpdateQueue } from "../../../hooks/data-fetching/course";
import { MOBILE_BP, PIN_CHAR_LIMIT } from "../../../constants";

interface QueuePinProps {
    courseId: number;
    queue: QueueType;
    mutate: mutateResourceListFunction<QueueType>;
}

const QueuePin = (props: QueuePinProps) => {
    const { courseId, queue, mutate } = props;
    const { id: queueId, pin } = queue;

    const [pinState, setPinState] = useState<string | undefined>(pin);
    const [editingPin, setEditingPin] = useState<boolean>(false);
    const pinInputRef = useRef<HTMLDivElement>(null);

    const isMobile = useMediaQuery(`(max-width: ${MOBILE_BP})`);

    useEffect(() => {
        function handleClickOutside(event) {
            if (
                pinInputRef.current &&
                !pinInputRef.current.contains(event.target) &&
                editingPin
            ) {
                setEditingPin(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [pinInputRef, editingPin]);

    const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.value.length <= PIN_CHAR_LIMIT && editingPin) {
            setPinState(e.target.value);
        }
    };

    const startPinEdit = () => {
        setPinState(pin);
        setEditingPin(true);
    };

    const endPinEdit = () => {
        setEditingPin(false);
        partialUpdateQueue(courseId, queueId, { pin: pinState });
        mutate(queueId, { pin: pinState });
    };

    return (
        <div
            className="ui input"
            style={{ marginTop: isMobile ? "1rem" : "0rem" }}
        >
            <label
                htmlFor="changePin"
                style={{
                    fontWeight: "bold",
                    margin: isMobile
                        ? "0.5rem 0.5rem 0rem 0rem"
                        : "0.5rem 0.5rem 0rem 2rem",
                }}
            >
                Pin:
            </label>
            <div
                ref={pinInputRef}
                className="ui input"
                style={{ height: "2.7rem" }}
            >
                <input
                    name="changePin"
                    value={editingPin ? pinState : pin}
                    onChange={handlePinChange}
                    onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
                        editingPin && e.key === "Enter" && endPinEdit();
                    }}
                    style={{
                        color: editingPin ? "black" : "#B9B9BA",
                        caretColor: editingPin ? "#75767F" : "transparent",
                        borderColor: "#22242626",
                        borderWidth: "1px",
                        backgroundColor: editingPin ? "white" : "#F1F1F2",
                        paddingRight: "2rem",
                        marginTop: "0rem",
                    }}
                />
                <Button
                    icon={
                        <Icon
                            name={editingPin ? "check" : "edit"}
                            onClick={editingPin ? endPinEdit : startPinEdit}
                        />
                    }
                    style={{
                        position: "relative",
                        padding: "0.5rem",
                        marginLeft: "-2.5rem",
                        backgroundColor: "transparent",
                        color: editingPin ? "black" : "#B9B9BA",
                    }}
                />
            </div>
        </div>
    );
};

export default QueuePin;
