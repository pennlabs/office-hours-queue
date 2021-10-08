/* eslint-disable react/jsx-props-no-spreading */
import { useMediaQuery } from "@material-ui/core";
import { Button, ButtonProps } from "semantic-ui-react";
import { MOBILE_BP } from "../../../constants";

interface ResponsiveIconButtonProps extends ButtonProps {
    text: string;
    icon: NonNullable<ButtonProps["icon"]>;
    mobileProps?: ButtonProps;
    desktopProps?: ButtonProps;
}

/* Icon button with text component. Text disappears at smaller breakpoints to leave only the icon */
const ResponsiveIconButton = ({
    text,
    icon,
    mobileProps,
    desktopProps,
    ...sharedProps
}: ResponsiveIconButtonProps) => {
    const isMobile = useMediaQuery(`(max-width: ${MOBILE_BP})`);

    const iconButton = <Button icon={icon} {...sharedProps} {...mobileProps} />;
    const iconTextButton = (
        <Button icon {...sharedProps} {...desktopProps}>
            {icon}
            {text}
        </Button>
    );

    return isMobile ? iconButton : iconTextButton;
};

export default ResponsiveIconButton;
