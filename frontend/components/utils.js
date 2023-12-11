export function pluralize(number, word) {
    return number === 1 ? word : word + "s";
}

export function dateToText(date) {
    const now = new Date();
    const diff = now - date;
    const seconds = diff / 1000;
    const minutes = seconds / 60;
    const hours = minutes / 60;
    const days = hours / 24;

    if (days > 7) {
        return date.toLocaleString();
    }

    if (days > 1) {
        return `${Math.floor(days)} ${pluralize(Math.floor(days), "day")} ago`;
    }

    if (hours > 1) {
        return `${Math.floor(hours)} ${pluralize(Math.floor(hours), "hour")} ago`;
    }

    if (minutes > 1) {
        return `${Math.floor(minutes)} ${pluralize(Math.floor(minutes), "minute")} ago`;
    }

    if (seconds > 1) {
        return `${Math.floor(seconds)} ${pluralize(Math.floor(seconds), "second")} ago`;
    }

    return "just now";
}

export function truncatePreviewText(text) {
    const max = 200;
    if (text.length > max) {
        return text.substring(0, max) + "... (click to read more)";
    }

    return text;
}

export function upvote(state, setState) {
    if (state.vote === 1) {
        state.vote = 0;
        state.votes -= 1;
    } else if (state.vote === -1) {
        state.vote = 1;
        state.votes += 2;
    } else {
        state.vote = 1;
        state.votes += 1;
    }

    setState({...state});
}

export function downvote(state, setState) {
    if (state.vote === -1) {
        state.vote = 0;
        state.votes += 1;
    } else if (state.vote === 1) {
        state.vote = -1;
        state.votes -= 2;
    } else {
        state.vote = -1;
        state.votes -= 1;
    }

    setState({...state});
}

export function getCommunity() {
    const split = location.href.split("/");
    const communityTag = split.indexOf("community");
    const community = split[communityTag + 1];
    return parseInt(community);
}

export function getPost() {
    const split = location.href.split("/");
    const postTag = split.indexOf("post");
    const post = split[postTag + 1];
    return parseInt(post);
}
