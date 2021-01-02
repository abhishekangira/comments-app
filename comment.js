import {
  newCCNode,
  addReply,
  deleteComment,
  editComment,
  getRandomColor,
  lastId
} from "./lib.js";

const template = document.createElement("template");
template.innerHTML = /*template*/ `
  <style>
    #comment-card {
      padding: 0.8rem;
      border-radius: 10px;
      margin-bottom: 0.5rem;
      animation: fadein 0.5s;
    }
    #edit-comment {
      display: none;
      margin-top: 0;
      margin-bottom: 1.1rem;
    }
    #edit-comment input {
      width: 45%;
    }
    #add-reply {
      margin-top: .5rem;
      display: none;
    }
    #add-reply input {
      width: 45%;
    }
    h5 {
      margin-top: 0;
      font-size: 1rem;
    }
    @keyframes fadein {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
  </style>
  <div id="comment-card">
    <h5>User</h5>
    <h4></h4>
    <div id="edit-comment">
      <input type="text" />
      <button id="save">Save</button>
    </div>
    <button id="reply">Reply</button>
    <button id="edit">Edit</button>
    <button id="delete">Delete</button>
    <button id="show"></button>
    <div id="add-reply">
      <input type="text" placeholder="Add reply here..." />
      <button>Reply</button>
    </div>
  </div>
  <div id="replies"></div>
`;

class Comment extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.appendChild(template.content.cloneNode(true));

    // Selectors
    this.$commentText = this.shadowRoot.querySelector("#comment-card h4");
    this.$commentCard = this.shadowRoot.getElementById("comment-card");
    this.$replyBtn = this.shadowRoot.getElementById("reply");
    this.$editBtn = this.shadowRoot.getElementById("edit");
    this.$saveBtn = this.shadowRoot.getElementById("save");
    this.$deleteBtn = this.shadowRoot.getElementById("delete");
    this.$showRepliesBtn = this.shadowRoot.getElementById("show");
    this.$addReplyDiv = this.shadowRoot.getElementById("add-reply");
    this.$addReplyBtn = this.shadowRoot.querySelector("#add-reply button");
    this.$addReplyInp = this.shadowRoot.querySelector("#add-reply input");
    this.$repliesDiv = this.shadowRoot.getElementById("replies");
    this.$editDiv = this.shadowRoot.getElementById("edit-comment");
    this.$editInp = this.shadowRoot.querySelector("#edit-comment input");

    // Other Stuff
    this.replies;
    this.noOfReplies;
    this.$parent;
    this.replyColor;

    // Flags
    this.newRepliesAdded = false;
  }

  replyColorChooser() {
    let color = getRandomColor();
    if (
      color === this.getAttribute("color") ||
      color === this.$parent.getAttribute("color")
    )
      return this.replyColorChooser();
    else this.replyColor = color;
  }

  connectedCallback() {
    this.$parent = this.getRootNode().host;
    this.replies = JSON.parse(this.getAttribute("replies"));
    this.setAttribute("noofreplies", this.replies.length);
    this.noOfReplies = this.getAttribute("noofreplies");
    this.replyColorChooser();

    // Event listeners
    this.$replyBtn.addEventListener("click", this.replyBtnHandler.bind(this));
    this.$deleteBtn.addEventListener("click", this.deleteBtnHandler.bind(this));
    this.$showRepliesBtn.addEventListener(
      "click",
      this.showRepliesHandler.bind(this)
    );
    this.$addReplyBtn.addEventListener(
      "click",
      this.addReplyHandler.bind(this)
    );
    this.$addReplyInp.addEventListener("keydown", (event) => {
      if (event.keyCode === 13) this.addReplyHandler();
    });
    this.$editBtn.addEventListener("click", this.openEditHandler.bind(this));
    this.$saveBtn.addEventListener("click", this.saveHandler.bind(this));
    this.$editInp.addEventListener("keydown", (event) => {
      if (event.keyCode === 13) this.saveHandler();
    });

    // Set Text
    this.$commentText.innerText = this.getAttribute("text");
    this.$showRepliesBtn.innerText =
      this.noOfReplies == 1
        ? `⏷ Show reply`
        : `⏷ Show ${this.noOfReplies} replies`;
    this.$editInp.value = this.getAttribute("text");

    // Styling
    if (this.noOfReplies == 0) this.$showRepliesBtn.style.display = "none";
    this.$commentCard.style.background = this.getAttribute("color");
  }

  static get observedAttributes() {
    return ["renderrepliesflag", "noofreplies"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "renderrepliesflag" && newValue == 1 && oldValue !== newValue)
      this.renderReplies();
    else if (name === "noofreplies" && oldValue !== null) {
      if (newValue == 0) this.$showRepliesBtn.style.display = "none";
      else if (newValue == 1) {
        this.$showRepliesBtn.innerText = "⏶ Hide reply";
      }
      console.log("replies changed");
    }
  }

  disconnectedCallback() {
    this.$replyBtn.removeEventListener(
      "click",
      this.replyBtnHandler.bind(this)
    );
    this.$deleteBtn.removeEventListener(
      "click",
      this.deleteBtnHandler.bind(this)
    );
  }

  // Event handlers
  deleteBtnHandler() {
    deleteComment(this.getAttribute("id"));
    this.$parent.setAttribute("noofreplies", --this.$parent.noOfReplies);
    this.remove();
  }

  replyBtnHandler() {
    if (this.$replyBtn.innerText === "Reply") {
      this.$addReplyDiv.style.display = "block";
      this.$replyBtn.innerText = "Cancel Reply";
    } else {
      this.$addReplyDiv.style.display = "none";
      this.$replyBtn.innerText = "Reply";
      this.$addReplyInp.value = "";
    }
  }

  addReplyHandler() {
    if (this.$addReplyInp.value !== "") {
      this.setAttribute("renderrepliesflag", "0");
      this.newRepliesAdded = true;
      addReply(this.$addReplyInp.value, this.getAttribute("id"));
      this.replies.push({
        id: lastId,
        text: this.$addReplyInp.value,
        replies: []
      });
      let commentCard = newCCNode(this.$addReplyInp.value, [], lastId);
      commentCard.setAttribute("color", this.replyColor);
      this.$addReplyInp.value = "";
      this.setAttribute("noofreplies", ++this.noOfReplies);
      this.replyBtnHandler();
      this.$showRepliesBtn.style.display = "inline-block";
      if (this.$showRepliesBtn.innerText.includes("Show")) {
        commentCard.style.display = "none";
        this.$showRepliesBtn.innerText =
          this.noOfReplies == 1
            ? `⏷ Show reply`
            : `⏷ Show ${this.noOfReplies} replies`;
      } else
        this.$showRepliesBtn.innerText =
          this.noOfReplies > 1 ? `⏶ Hide replies` : `⏶ Hide reply`;
      this.$repliesDiv.appendChild(commentCard);
    }
  }

  showRepliesHandler() {
    if (this.newRepliesAdded) {
      this.$repliesDiv.innerHTML = null;
      this.newRepliesAdded = false;
    }
    this.setAttribute("renderrepliesflag", "1");
    if (this.$showRepliesBtn.innerText.includes("⏷")) {
      this.$repliesDiv.style.display = "block";
      this.$showRepliesBtn.innerText =
        this.noOfReplies > 1 ? `⏶ Hide replies` : `⏶ Hide reply`;
    } else {
      this.$repliesDiv.style.display = "none";
      this.$showRepliesBtn.innerText =
        this.noOfReplies == 1
          ? `⏷ Show reply`
          : `⏷ Show ${this.noOfReplies} replies`;
    }
  }

  openEditHandler() {
    if (this.$editBtn.innerText === "Edit") {
      this.$editDiv.style.display = "block";
      this.$commentText.style.display = "none";
      this.$editBtn.innerText = "Cancel Edit";
    } else {
      this.$editDiv.style.display = "none";
      this.$editBtn.innerText = "Edit";
      this.$commentText.style.display = "block";
    }
  }

  saveHandler() {
    this.setAttribute("text", this.$editInp.value);
    editComment(this.getAttribute("id"), this.getAttribute("text"));
    this.$commentText.innerText = this.getAttribute("text");
    this.$editDiv.style.display = "none";
    this.$editBtn.innerText = "Edit";
    this.$commentText.style.display = "block";
  }

  renderReplies() {
    this.replies.forEach((reply) => {
      let commentCard = newCCNode(reply.text, reply.replies, reply.id);
      commentCard.setAttribute("color", this.replyColor);
      this.$repliesDiv.appendChild(commentCard);
    });
    console.log("renderReplies()");
  }
}

customElements.define("ce-comment", Comment);
