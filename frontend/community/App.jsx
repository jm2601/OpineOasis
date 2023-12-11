import './App.css'
import Post from "../components/Post.jsx";
import {useEffect, useState} from 'react';
import {getCommunity} from "../components/utils.js";

function renderPosts(state) {
    return state.posts.map((post) => {
        const image = post.image ? `/file?id=` + post.image : undefined;
        const user = {
            username: post.user.name === null ? (post.user.username === null ? "Anonymous" : post.user.username) : post.user.name,
            avatar: post.user.avatar ? `/file?id=` + post.user.avatar : "/opineoasis2.svg"
        };
        const date = new Date(post.date);

        return (
            <Post key={post.id} vote={post.vote} community={getCommunity()} id={post.id} votes={post.votes} comments={post.comments} date={date} user={user} title={post.title} text={post.text} img={image} />
        )
    });
}

async function getPosts(state, setState) {
    const response = await fetch(`/api/community/${getCommunity()}`);

    setState({
        ...state,
        posts: await response.json()
    });
}

function App() {
    const [state, setState] = useState({
        posts: []
    });

    useEffect(() => {
        getPosts(state, setState);
    }, []);

    return renderPosts(state);
}

export default App
