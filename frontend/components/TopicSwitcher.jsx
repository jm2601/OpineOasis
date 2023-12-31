import "./TopicSwitcher.css";
import {useEffect, useMemo, useState} from "react";
import {
    Autocomplete,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle, IconButton,
    TextField
} from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import {getCommunity} from "./utils.js";
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';


async function autocompleteCommunity(state, setState) {
    try {
        const response = await fetch("/api/community");
        const body = await response.json();

        if (response.status !== 200) {
            throw Error(body.message);
        }

        const results = body.map((community) => {
            return {
                label: community.name,
                id: community.id,
                type: "Community",
            };
        });

        let searchQuery = results.find((result) => result.id === getCommunity());
        if (searchQuery === undefined) {
            searchQuery = {
                label: "In the abyss~",
                id: null,
                type: "Community",
            }
        }

        setState({
            ...state,
            searchResults: results,
            searchQuery: searchQuery,
        });
    } catch (e) {
        console.error("Failed to autocomplete community: " + e);

        setState({
            ...state,
            searchResults: [],
        });
    }
}

// const TESTING_SEARCH_RESULTS = [
//     {label: "Topic 1", id: "topic1", type: "Topic"},
//     {label: "Topic 2", id: "topic2", type: "Topic"},
//     {label: "Topic 3", id: "topic3", type: "Topic"},
//     {label: "Topic 4", id: "topic4", type: "Topic"},
//     {label: "Topic 5", id: "topic5", type: "Topic"},
//     {label: "User 1", id: "user1", type: "User"},
//     {label: "User 2", id: "user2", type: "User"},
//     {label: "User 3", id: "user3", type: "User"},
//     {label: "User 4", id: "user4", type: "User"},
//     {label: "User 5", id: "user5", type: "User"},
// ];

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
    formData.append("file", state.imageUpload);

    try {
        const response = await fetch(`/api/community/${state.searchQuery.id}/post`, {
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
        searchResults: [],
        searchQuery: [],
        postEditorOpen: false,
        title: "",
        text: "",
        imageUpload: null,
        postLoading: false,
        doingMagic: false,
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

    const summonMagic = async () => {
        setState({...state, doingMagic: true});

        try {
            const response = await fetch("/api/magic/post", {
                method: "POST",
                body: JSON.stringify({
                    community: state.searchQuery.id,
                    title: state.title,
                    text: state.text,
                }),
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const body = await response.json();

            if (response.status !== 200) {
                throw Error(body.message);
            }

            setState({
                ...state,
                title: body.title,
                text: body.text,
                doingMagic: false,
            });
        } catch (e) {
            console.error("Failed to summon magic: " + e);

            alert("Failed to summon magic: " + e);

            setState({
                ...state,
                doingMagic: false,
            });
        }
    }

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
                        location.href = `/community/${value.id}`;
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
                    <DialogContentText style={{color: "#999999"}}>
                        <IconButton onClick={summonMagic} disabled={state.doingMagic}><AutoFixHighIcon/></IconButton> {state.doingMagic ? "Summoning magic..." : "Summon magic to help you write your post!"}
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
                        disabled={state.doingMagic}
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
                        disabled={state.doingMagic}
                    />
                    <DialogContentText style={{marginTop: "20px"}}>
                        Maybe add an image?
                    </DialogContentText>
                    <Button
                        variant="contained"
                        component="label"
                        style={state.imageUpload ? {backgroundColor: "limegreen"} : null}
                        disabled={state.doingMagic}
                    >
                        Upload Image
                        <input
                            type="file"
                            id={"image-upload"}
                            accept={"image/*"}
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
                    <LoadingButton onClick={() => submitPost(state, setState)} loading={state.postLoading} disabled={state.doingMagic}>Post</LoadingButton>
                </DialogActions>
            </Dialog>
        </span>
    )
}