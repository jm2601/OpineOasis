import "./TopicSwitcher.css";
import {useEffect, useMemo, useState} from "react";
import {Autocomplete, TextField} from "@mui/material";


async function autocompleteCommunity(state, setState) {
    try {
        const response = await fetch("/community/autocomplete");
        const body = await response.json();

        if (response.status !== 200) {
            throw Error(body.message);
        }

        setState({
            ...state,
            searchResults: body.results
        });
    } catch (e) {
        console.error("Failed to autocomplete community: " + e);

        setState({
            ...state,
            searchResults: [],
        });
    }

}

const TESTING_SEARCH_RESULTS = [
    { label: "Topic 1", id: "topic1", type: "Topic" },
    { label: "Topic 2", id: "topic2", type: "Topic" },
    { label: "Topic 3", id: "topic3", type: "Topic" },
    { label: "Topic 4", id: "topic4", type: "Topic" },
    { label: "Topic 5", id: "topic5", type: "Topic" },
    { label: "User 1", id: "user1", type: "User" },
    { label: "User 2", id: "user2", type: "User" },
    { label: "User 3", id: "user3", type: "User" },
    { label: "User 4", id: "user4", type: "User" },
    { label: "User 5", id: "user5", type: "User" },
];

export default function TopicSwitcher() {
    const [state, setState] = useState({
        searchResults: TESTING_SEARCH_RESULTS,
        searchQuery: TESTING_SEARCH_RESULTS[3]
    });

    useEffect(() => {
        autocompleteCommunity(state, setState);
    }, []);

    const options = useMemo(() => {
        const output = [];
        const groups = Object.groupBy(state.searchResults, (result) => result.type);
        Object.entries(groups).forEach(([_, value]) => {
            output.push(...value.toSorted((a, b) => a.label.localeCompare(b.label)))
        });

        return output;
    }, [state.searchResults]);

    return (
        <Autocomplete
            options={options}
            groupBy={(option) => option.type}
            getOptionLabel={(option) => option.label}
            size={"small"}
            sx={{ width: 300, backgroundColor: "white", borderRadius: "5px" }}
            renderInput={(params) => <TextField {...params} label="Community" />}
            onChange={(event, value) => {
                if (value) {
                    console.log(value);
                }
            }}
            value={state.searchQuery}
        />
    )
}