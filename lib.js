let tempData = [
  {
    id: "0",
    text: "Welcome to the comments app!",
    replies: [
      {
        id: "2",
        text: "You can have replies at infinite levels",
        replies: [
          {
            id: "3",
            text: "Yes really, try for yourself.",
            replies: [],
          },
        ],
      },
      {
        id: "4",
        text: "Feel free to edit, delete or add new comments or replies.",
        replies: [],
      },
    ],
  },
  {
    id: "1",
    text: "All comments are stored in your browser's localstorage",
    replies: [],
  },
];


export const getComments = () => JSON.parse(localStorage.getItem("data"));
export const setComments = (arr) => localStorage.setItem("data", JSON.stringify(arr));

if (!localStorage.getItem("data")) setComments(tempData);

let commentsArray = getComments();

const colors = [
  "#55efc4",
  "#81ecec",
  "#74b9ff",
  "#dfe6e9",
  "#00b894",
  "#00cec9",
  "#b2bec3",
  "#ffeaa7",
  "#fab1a0",
  "#ff7675",
  "#fd79a8",
];

export let lastId = 4;

export const getRandomColor = () => colors[Math.floor(Math.random() * colors.length)];

const findCommentObject = (id, fn, arr = commentsArray) => {
  if (arr.length !== 0) {
    arr.forEach((cObj) => {
      for (let key in cObj) {
        if (Array.isArray(cObj[key])) findCommentObject(id, fn, cObj[key]);
        else if (key === "id" && cObj[key] === id) {
          fn(cObj, arr);
        }
      }
    });
  }
};

export const newCCNode = (text, replies, id) => {
  // CC = Comment Card
  let commentCard = document.createElement("ce-comment");
  replies = JSON.stringify(replies);
  commentCard.setAttribute("text", text);
  commentCard.setAttribute("replies", replies);
  commentCard.setAttribute("id", id);
  commentCard.setAttribute("renderrepliesflag", "0");
  return commentCard;
};

export const addComment = (text) => {
  commentsArray.push({
    id: String(++lastId),
    text: text,
    replies: [],
  });
  setComments(commentsArray);
};

export const addReply = (text, id) => {
  findCommentObject(id, (obj) => {
    obj.replies.push({
      id: String(++lastId),
      text: text,
      replies: [],
    });
  });
  setComments(commentsArray);
  console.log("Reply added", commentsArray);
};

export const deleteComment = (id) => {
  findCommentObject(id, (obj, arr) => {
    arr.splice(arr.indexOf(obj), 1);
  });
  setComments(commentsArray);
  console.log("Comment deleted", commentsArray);
};

export const editComment = (id, text) => {
  findCommentObject(id, (obj) => {
    obj.text = text;
  });
  setComments(commentsArray);
  console.log("Comment edited", commentsArray);
};
