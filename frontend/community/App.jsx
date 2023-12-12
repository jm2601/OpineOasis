import './App.css'
import Post from "../components/Post.jsx";
import {useEffect, useState} from 'react';
import {getCommunity} from "../components/utils.js";

async function getCurrentUserId(state, setState) {
    try {
        const response = await fetch("/me");
        const body = await response.json();

        if (response.status !== 200) {
            throw Error(body.message);
        }

        state.currentUser = body.id;
        setState({ ...state });
    } catch (e) {
        // ignore
    }
}

function renderPosts(state) {
    return state.posts.map((post) => {
        const image = post.image ? `/file?id=` + post.image : undefined;
        const user = {
            id: post.user.id,
            username: post.user.name === null ? (post.user.username === null ? "Anonymous" : post.user.username) : post.user.name,
            avatar: post.user.avatar ? `/file?id=` + post.user.avatar : "/opineoasis2.svg"
        };
        const date = new Date(post.date);

        return (
            <Post key={post.id} currentUser={state.currentUser} vote={post.vote} community={getCommunity()} id={post.id} votes={post.votes} comments={post.comments} date={date} user={user} title={post.title} text={post.text} img={image} />
        )
    });
}

async function getPosts(state, setState) {
    await getCurrentUserId(state, setState);
    const response = await fetch(`/api/community/${getCommunity()}`);

    state.posts = await response.json();
    setState({ ...state });
}

function App() {
    const [state, setState] = useState({
        posts: [],
        currentUser: null
    });

    useEffect(() => {
        getPosts(state, setState);
    }, []);

    return renderPosts(state);
}

export default App
