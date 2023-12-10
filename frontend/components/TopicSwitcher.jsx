import "./TopicSwitcher.css";
import {useEffect, useMemo, useState} from "react";
import {
    Autocomplete,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    TextField
} from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";


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
    {label: "Topic 1", id: "topic1", type: "Topic"},
    {label: "Topic 2", id: "topic2", type: "Topic"},
    {label: "Topic 3", id: "topic3", type: "Topic"},
    {label: "Topic 4", id: "topic4", type: "Topic"},
    {label: "Topic 5", id: "topic5", type: "Topic"},
    {label: "User 1", id: "user1", type: "User"},
    {label: "User 2", id: "user2", type: "User"},
    {label: "User 3", id: "user3", type: "User"},
    {label: "User 4", id: "user4", type: "User"},
    {label: "User 5", id: "user5", type: "User"},
];

async function handlePost(state, setState) {
    try {
        const response = await fetch("/me");
        const body = await response.json();

        if (response.status !== 200) {
            throw Error(body.message);
        }
    } catch (e) {
        console.error("Failed to get user; probably not logged in: " + e);
        location.href = "/login";
        return;
    }

    setState({
        ...state,
        postEditorOpen: true,
        imageUpload: null,
    });
}

async function submitPost(state, setState) {
    setState({
        ...state,
        postLoading: true,
    });

    const formData = new FormData();
    formData.append("title", state.title);
    formData.append("text", state.text);
    formData.append("image", state.imageUpload);

    try {
        const response = await fetch(`/community/${state.searchQuery.id}/post`, {
            method: "POST",
            body: formData,
        });
        const body = await response.json();

        if (response.status !== 200) {
            throw Error(body.message);
        }

        location.href = `/community/${state.searchQuery.id}/post/${body.id}`;
    } catch (e) {
        console.error("Failed to submit post: " + e);

        alert("Failed to submit post: " + e);

        setState({
            ...state,
            postLoading: false,
        });
    }
}

export default function TopicSwitcher() {
    const [state, setState] = useState({
        searchResults: TESTING_SEARCH_RESULTS,
        searchQuery: TESTING_SEARCH_RESULTS[3],
        postEditorOpen: false,
        title: "",
        text: "",
        imageUpload: null,
        postLoading: false,
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

    const handleClose = () => setState({...state, postEditorOpen: false});

    return (
        <span className={"topic-switcher-container"}>
            <Autocomplete
                options={options}
                groupBy={(option) => option.type}
                getOptionLabel={(option) => option.label}
                size={"small"}
                sx={{width: 300, backgroundColor: "white", borderRadius: "5px"}}
                renderInput={(params) => <TextField {...params} label="Community"/>}
                onChange={(event, value) => {
                    if (value) {
                        console.log(value);
                    }
                }}
                value={state.searchQuery}
            />
            <Button variant={"contained"} sx={{marginLeft: "10px"}} onClick={() => handlePost(state, setState)}>Create post</Button>
            <Dialog open={state.postEditorOpen} onClose={handleClose}>
                <DialogTitle>Create post</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Create a post in {state.searchQuery.label}. Please have fun and be nice! Or don't, I'm not your mom.
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="name"
                        label="Title"
                        type="text"
                        fullWidth
                        variant="standard"
                        onChange={(e) => setState({...state, title: e.target.value})}
                        value={state.title}
                    />
                    <TextField
                        margin="dense"
                        id="name"
                        label="Text"
                        type="text"
                        fullWidth
                        variant="standard"
                        multiline
                        rows={4}
                        onChange={(e) => setState({...state, text: e.target.value})}
                        value={state.text}
                    />
                    <DialogContentText style={{marginTop: "20px"}}>
                        Maybe add an image?
                    </DialogContentText>
                    <Button
                        variant="contained"
                        component="label"
                        style={state.imageUpload ? {backgroundColor: "limegreen"} : null}
                    >
                        Upload Image
                        <input
                            type="file"
                            id={"image-upload"}
                            onChange={(event) => {
                                setState({
                                    ...state,
                                    imageUpload: event.target.files[0],
                                });
                            }}
                            hidden
                        />
                    </Button>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <LoadingButton onClick={() => submitPost(state, setState)} loading={state.postLoading}>Post</LoadingButton>
                </DialogActions>
            </Dialog>
        </span>
    )
}