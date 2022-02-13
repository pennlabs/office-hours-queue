/* eslint-disable react/jsx-props-no-spreading */
import Linkify from "react-linkify";

interface LinkedTextProps {
    text: string;
}

const LinkedText = ({ text }: LinkedTextProps) => {
    const componentDecorator = (
        decoratedHref: string,
        decoratedText: string,
        key: number
    ) => (
        <a
            href={decoratedHref}
            key={key}
            target="_blank"
            rel="noreferrer noope"
        >
            {decoratedText}
        </a>
    );

    const linkified = (
        <Linkify componentDecorator={componentDecorator}>{text}</Linkify>
    );
    return linkified;
};

export default LinkedText;
