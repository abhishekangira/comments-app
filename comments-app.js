import { newCCNode, getComments, addComment, getRandomColor, lastId } from "./lib.js";

const commentsContainer = document.createElement("template");

const color = getRandomColor();

commentsContainer.innerHTML = /*template*/ `
<style>
  #comment-widget {
    background: white;
    max-width: 40rem;
    width: 80vw;
    height: 85vh;
    box-shadow: 0 2px 10px #b3b3b3;
    margin-top: 1rem;
    border-radius: 10px;
    padding: 0.8rem;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: space-between;
  }

  #show-comments {
    background: white;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    padding: 0.5rem;
    border-radius: 10px;
    flex: 12;
    margin-bottom: 1rem;
    overflow-y: scroll;
  }

  #show-comments::-webkit-scrollbar {
    display: none;
  }

  #add-comment {
    background: white;
    min-height: 3rem;
    border-radius: 10px;
    display: flex;
    justify-content: space-evenly;
    padding: 0.8rem;
    flex: 1;
    transition: all 0.2s;
    box-shadow: 0 1px 3px #b3b3b3;
  }

  #add-comment input {
    flex: 5;
    border-radius: 10px 0 0 10px;
    border: none;
    padding-left: 0.5rem;
    outline: none;
  }

  #add-comment button {
    flex: 1;
    border-radius: 0 10px 10px 0;
    border: none;
    border-left: none;
    outline: none;
    background: ${color};
  }

  #add-comment button:hover {
    background: ${getRandomColor()};
  }

</style>

<div id="comment-widget">
  <div id="show-comments">
  </div>
  <div id="add-comment">
    <input type="text" placeholder="Add comment here..." />
    <button>Comment</button>
  </div>
</div>
`;

class CommentsApp extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.appendChild(commentsContainer.content.cloneNode(true));

    // Selectors
    this.$commentButton = this.shadowRoot.querySelector("#add-comment button");
    this.$commentInput = this.shadowRoot.querySelector("#add-comment input");
    this.$showCommentsArea = this.shadowRoot.querySelector("#show-comments");
    this.add = this.$showCommentsArea.appendChild;

    // Other Stuff
    this.renderComments();
  }

  connectedCallback() {
    this.$commentButton.addEventListener("click", this.addCommentHandler.bind(this));
    this.$commentInput.addEventListener("keydown", (event) => {
      if (event.keyCode === 13) this.addCommentHandler();
    });
  }
  disconnectedCallback() {}

  // Event Handlers
  addCommentHandler() {
    if (this.$commentInput.value !== "") {
      addComment(this.$commentInput.value);
      let commentCard = newCCNode(this.$commentInput.value, [], lastId);
      commentCard.setAttribute("color", color);
      this.$showCommentsArea.appendChild(commentCard);
      this.$commentInput.value = "";
      this.$showCommentsArea.scrollTop = this.$showCommentsArea.scrollHeight;
      console.log("Comment added", getComments());
    }
  }

  renderComments() {
    getComments().forEach((comment) => {
      let commentCard = newCCNode(comment.text, comment.replies, comment.id);
      commentCard.setAttribute("color", color);
      this.$showCommentsArea.appendChild(commentCard);
    });
    this.$showCommentsArea.scrollTop = this.$showCommentsArea.scrollHeight;
  }
}

customElements.define("comments-app", CommentsApp);
