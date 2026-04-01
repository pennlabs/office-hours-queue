const now = new Date();
export const isAprilFools = now.getMonth() === 3 && now.getDate() === 1;

export const SITE_NAME = isAprilFools ? "OHS" : "OHQ";
export const SITE_FULL_NAME = isAprilFools
    ? "Office Hours Stack"
    : "Office Hours Queue";

export const LOGO_PATH = isAprilFools ? "ohs.png" : "ohq.png";
export const LOGO_LOGIN_PATH = isAprilFools ? "ohs-login.png" : "ohq-login.png";
export const LOGO_SIDEBAR_PATH = isAprilFools
    ? "../../../ohs.png"
    : "../../../ohq.png";

export const QUEUE_LABEL = isAprilFools ? "Stack" : "Queue";
export const QUEUES_LABEL = isAprilFools ? "Stacks" : "Queues";
export const queueLabel = isAprilFools ? "stack" : "queue";
export const queuesLabel = isAprilFools ? "stacks" : "queues";
