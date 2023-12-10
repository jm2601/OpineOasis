import './App.css'
import MainContent from "../components/MainContent.jsx";
import Post from "../components/Post.jsx";

function App() {
    return (
        <>
            <Post date={new Date(2023, 11, 9, 20, 0, 0)} user={{username: "DoggySazHi", avatar: "https://avatars.githubusercontent.com/u/42221528"}} title="ok but reimu" text="something about mikos and simping idk" img={"https://cdn.donmai.us/original/01/b0/__hakurei_reimu_touhou_drawn_by_saimu_taju__01b0f02a8b158b218414cb7af4d11b1e.jpg"} />
            <Post date={new Date(2023, 11, 9, 20, 0, 0)} user={{username: "DoggySazHi", avatar: "https://avatars.githubusercontent.com/u/42221528"}} title="marisa?" text="something about mikos and simping idk" img={"https://cdn.donmai.us/original/01/b0/__hakurei_reimu_touhou_drawn_by_saimu_taju__01b0f02a8b158b218414cb7af4d11b1e.jpg"} />
            <Post date={new Date(2023, 11, 9, 20, 0, 0)} user={{username: "DoggySazHi", avatar: "https://avatars.githubusercontent.com/u/42221528"}} title="i'm going insanae" text="testing long text Bacon ipsum dolor amet pancetta biltong pork loin tenderloin buffalo andouille kevin shank brisket pastrami strip steak. Brisket beef kevin porchetta drumstick. Venison bresaola meatloaf shoulder beef ribs. Cupim picanha hamburger doner cow boudin pig jowl frankfurter. Filet mignon kielbasa jerky corned beef. Beef ribs short loin salami spare ribs cupim tongue bresaola. Ham hock burgdoggen short ribs, sausage chicken pork loin doner hamburger pastrami andouille fatback prosciutto drumstick. Pork belly buffalo meatball ribeye meatloaf shoulder tenderloin. Brisket bacon prosciutto doner, ham hock spare ribs cow pork capicola tri-tip. Tri-tip turkey jerky tail kevin, pig corned beef meatloaf ribeye biltong frankfurter leberkas short ribs. Spare ribs cupim beef meatball jowl chuck swine porchetta ham hock short loin." img={"https://cdn.donmai.us/original/01/b0/__hakurei_reimu_touhou_drawn_by_saimu_taju__01b0f02a8b158b218414cb7af4d11b1e.jpg"} />
        </>
    )
}

export default App
