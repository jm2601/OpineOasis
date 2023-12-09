import "./TopicSwitcher.css";
import {useMemo, useState} from "react";
import {Autocomplete, TextField} from "@mui/material";


export default function TopicSwitcher() {
    const [state, setState] = useState({
        searchResults: [
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
        ],
        searchQuery: { label: "Topic 1", id: "topic1", type: "Topic" }
    });

    const options = useMemo(() => {
        const output = [];
        const groups = Object.groupBy(state.searchResults, (result) => result.type);
        Object.entries(groups).forEach(([_, value]) => {
            output.push(...value.toSorted((a, b) => a.label.localeCompare(b.label)))
        });

        console.log(output);
        return output;
    }, [state.searchResults]);

    return (
        <Autocomplete
            id="grouped-demo"
            options={options}
            groupBy={(option) => option.type}
            getOptionLabel={(option) => option.label}
            size={"small"}
            sx={{ width: 300, backgroundColor: "white", borderRadius: "5px" }}
            renderInput={(params) => <TextField {...params} label="Topic Switcher" />}
            onChange={(event, value) => {
                if (value) {
                    console.log(value);
                }
            }}
            value={state.searchQuery}
        />
    )
}