const COMMUNITY_LIKED_KEY = "auraCommunityLikedPosts";
const COMMUNITY_LIKE_COUNTS_KEY = "auraCommunityLikeCounts";
const COMMUNITY_COMMENT_KEY = "auraCommunityDetailComments";

const detailProfileImage = document.getElementById("detailProfileImage");
const detailAuthor = document.getElementById("detailAuthor");
const detailMeta = document.getElementById("detailMeta");
const detailWeather = document.getElementById("detailWeather");
const detailPostImage = document.getElementById("detailPostImage");
const detailTitle = document.getElementById("detailTitle");
const detailBody = document.getElementById("detailBody");
const detailPlusButtons = document.querySelectorAll(".detail-plus-button");
const detailProductBoxes = document.querySelectorAll(".detail-product-box");

const detailLikeButton = document.getElementById("detailLikeButton");
const detailLikeIcon = document.getElementById("detailLikeIcon");
const detailLikeCount = document.getElementById("detailLikeCount");
const detailCommentCount = document.getElementById("detailCommentCount");
const detailCommentTitleCount = document.getElementById(
  "detailCommentTitleCount",
);

const detailShareButton = document.getElementById("detailShareButton");
const detailCommentList = document.getElementById("detailCommentList");
const detailMoreButton = document.getElementById("detailMoreButton");
const detailCommentInput = document.getElementById("detailCommentInput");
const detailSendButton = document.getElementById("detailSendButton");

let visibleCommentCount = 5;

const communityDetailPosts = [
  {
    id: "post-1",
    author: "김지수",
    meta: "30분 전 · 경기 김포",
    weather: "10° 흐림",
    profileImage: "./images/icons/profile03.png",
    postImage:
      "https://unsplash.com/photos/nimElTcTNyY/download?force=true&w=640",
    tag: "#OOTD",
    title: "이런날엔 특색있는 노란 후드티를 입어줘야합니다!!",
    body: "오늘 날씨가 흐린데도 좋아서 밝은 색 입고 싶더라고요. 그래서 노란 후드 세트로 코디해봤는데 생각보다 훨씬 괜찮았어요! 색이 포인트가 돼서 사진도 잘 나오고 전체적으로 분위기가 확 살아나는 느낌이에요. 편하기도 해서 가볍게 외출할 때 입기 좋은 것 같아요. 이런 날엔 이런 밝은 컬러 한번 입어보는 것도 추천합니다 :)",
    likes: 150,
    comments: 18,
    commentList: [
      {
        type: "user",
        name: "이현우",
        time: "28분 전",
        profileImage: "./images/icons/profile06.png",
        text: "와 노란색 진짜 잘 어울리세요! 사진 보자마자 눈에 확 들어오네요 😆",
      },
      {
        type: "reply",
        time: "25분 전",
        text: "감사합니다!! 생각보다 색이 예쁘게 나와서 저도 마음에 들었어요 😊",
      },
      {
        type: "user",
        name: "김선정",
        time: "25분 전",
        profileImage: "./images/icons/profile01.png",
        text: "색감 너무 예쁜데요? 이런 컬러 저도 한번 도전해보고 싶어졌어요.",
      },
      {
        type: "user",
        name: "주의정",
        time: "20분 전",
        profileImage: "./images/icons/profile02.png",
        text: "노란 후드 세트 어디 제품인가요? 완전 귀엽네요 ㅎㅎ",
      },
      {
        type: "reply",
        time: "15분 전",
        text: "브랜드는 코*인데 요즘 후드 세트 많이 나오더라고요! 편해서 자주 입게 돼요.",
      },
    ],
  },
  {
    id: "post-2",
    author: "주의정",
    meta: "1시간 전 · 서울 마포",
    weather: "8° 맑음",
    profileImage: "./images/icons/profile02.png",
    postImage:
      "https://unsplash.com/photos/LPLJGX0UnTE/download?force=true&w=640",
    tag: "#오늘의 코디",
    title: "맑은날에 원피스로 기분 전환 해보세요.",
    body: "맑은 날에는 산뜻한 원피스 하나만으로도 기분이 좋아지는 것 같아요. 오늘은 가볍고 편한 스타일로 코디해봤습니다.",
    likes: 50,
    comments: 3,
    commentList: [
      {
        type: "user",
        name: "김지수",
        time: "55분 전",
        profileImage: "./images/icons/profile03.png",
        text: "원피스 색감 너무 예뻐요!",
      },
      {
        type: "reply",
        time: "40분 전",
        text: "감사해요 :) 저도 오늘 코디 마음에 들었어요.",
      },
    ],
  },
  {
    id: "post-3",
    author: "김선정",
    meta: "2시간 전 · 전북 전주",
    weather: "5° 흐림",
    profileImage: "./images/icons/profile01.png",
    postImage:
      "https://unsplash.com/photos/Y5AvIS752zU/download?force=true&w=640",
    tag: "#트랜드",
    title: "요새는 이런 스타일링이 감각있어 보입니다.",
    body: "포인트 있는 선글라스와 컬러감 있는 아우터를 함께 매치해봤어요. 과하지 않으면서도 분위기가 살아나는 스타일이라 마음에 들어요.",
    likes: 300,
    comments: 150,
    commentList: [
      {
        type: "user",
        name: "주의정",
        time: "1시간 전",
        profileImage: "./images/icons/profile02.png",
        text: "선글라스 포인트가 진짜 좋아요!",
      },
      {
        type: "reply",
        time: "58분 전",
        text: "맞아요! 이번엔 선글라스가 포인트예요.",
      },
    ],
  },
  {
    id: "post-4",
    author: "박하린",
    meta: "3시간 전 · 부산 해운대",
    weather: "12° 맑음",
    profileImage: "./images/icons/profile04.png",
    postImage:
      "https://unsplash.com/photos/eB9WHlT8yeA/download?force=true&w=640",
    tag: "#데일리룩",
    title: "가벼운 자켓 하나로 완성한 주말 코디예요.",
    body: "주말에는 너무 꾸민 느낌보다 편안한 무드가 좋은 것 같아요. 자켓 하나로 깔끔하게 마무리했습니다.",
    likes: 89,
    comments: 12,
    commentList: [],
  },
  {
    id: "post-5",
    author: "이서윤",
    meta: "4시간 전 · 대구 중구",
    weather: "7° 흐림",
    profileImage: "./images/icons/profile05.png",
    postImage:
      "https://unsplash.com/photos/lzm5dzQaROc/download?force=true&w=640",
    tag: "#미니멀",
    title: "차분한 톤으로 맞춘 오늘의 미니멀 룩입니다.",
    body: "튀지 않지만 안정감 있는 색 조합으로 코디해봤어요. 데일리로 입기 좋은 스타일입니다.",
    likes: 210,
    comments: 34,
    commentList: [],
  },
];

const autoCommentNames = [
  "서하은",
  "윤지아",
  "박민서",
  "최유나",
  "정다은",
  "한지우",
  "오수빈",
  "강예린",
  "문채원",
  "임하늘",
];

const autoCommentTexts = [
  "코디 색감이 너무 예뻐요!",
  "저도 이런 스타일 한번 입어보고 싶어요.",
  "사진 분위기랑 옷이 정말 잘 어울려요.",
  "오늘 날씨랑 딱 맞는 코디 같아요.",
  "컬러 포인트가 진짜 좋네요.",
  "편해 보이면서도 스타일리시해요.",
  "이런 조합 참고해봐야겠어요.",
  "전체적인 분위기가 너무 좋아요.",
  "깔끔하면서도 포인트가 있어서 예뻐요.",
  "다음 코디도 기대돼요!",
];

const autoCommentProfiles = [
  "./images/icons/profile01.png",
  "./images/icons/profile02.png",
  "./images/icons/profile03.png",
  "./images/icons/profile04.png",
  "./images/icons/profile05.png",
  "./images/icons/profile06.png",
];

const getPostIdFromURL = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get("id") || "post-1";
};

const currentPostId = getPostIdFromURL();

const currentPost =
  communityDetailPosts.find((post) => post.id === currentPostId) ||
  communityDetailPosts[0];

const getLikedPostIds = () => {
  const savedLikedPosts = localStorage.getItem(COMMUNITY_LIKED_KEY);

  if (!savedLikedPosts) {
    return [];
  }

  try {
    return JSON.parse(savedLikedPosts);
  } catch (error) {
    return [];
  }
};

const saveLikedPostIds = (likedPostIds) => {
  localStorage.setItem(COMMUNITY_LIKED_KEY, JSON.stringify(likedPostIds));
};

const getSavedLikeCounts = () => {
  const savedLikeCounts = localStorage.getItem(COMMUNITY_LIKE_COUNTS_KEY);

  if (!savedLikeCounts) {
    return {};
  }

  try {
    return JSON.parse(savedLikeCounts);
  } catch (error) {
    return {};
  }
};

const saveLikeCounts = (likeCounts) => {
  localStorage.setItem(COMMUNITY_LIKE_COUNTS_KEY, JSON.stringify(likeCounts));
};

const getSavedComments = () => {
  const savedComments = localStorage.getItem(COMMUNITY_COMMENT_KEY);

  if (!savedComments) {
    return {};
  }

  try {
    return JSON.parse(savedComments);
  } catch (error) {
    return {};
  }
};

const saveComments = (comments) => {
  localStorage.setItem(COMMUNITY_COMMENT_KEY, JSON.stringify(comments));
};

const getMyProfile = () => {
  return {
    name:
      localStorage.getItem("auraMyNickname") ||
      localStorage.getItem("auraNickname") ||
      localStorage.getItem("auraUserNickname") ||
      "싹난감자",

    profileImage:
      localStorage.getItem("auraMyProfileImage") ||
      localStorage.getItem("auraProfileImage") ||
      localStorage.getItem("auraUserProfileImage") ||
      "./images/icons/my/profile.png",
  };
};

const getPostLikeCount = () => {
  const savedLikeCounts = getSavedLikeCounts();

  return savedLikeCounts[currentPost.id] ?? currentPost.likes;
};

const createAutoComments = (post) => {
  const baseCommentCount = post.commentList.length;
  const needCount = Math.max(post.comments - baseCommentCount, 0);

  return Array.from({ length: needCount }, (_, index) => {
    return {
      type: "user",
      name: autoCommentNames[index % autoCommentNames.length],
      time: `${index + 1}분 전`,
      profileImage: autoCommentProfiles[index % autoCommentProfiles.length],
      text: autoCommentTexts[index % autoCommentTexts.length],
    };
  });
};

const getCommentAgeInMinutes = (timeText) => {
  if (!timeText || timeText === "방금 전") {
    return 0;
  }

  if (timeText.includes("시간")) {
    return Number(timeText.replace(/[^0-9]/g, "")) * 60;
  }

  if (timeText.includes("분")) {
    return Number(timeText.replace(/[^0-9]/g, ""));
  }

  return 0;
};

const getPostComments = () => {
  const savedComments = getSavedComments();
  const addedComments = savedComments[currentPost.id] || [];
  const autoComments = createAutoComments(currentPost);

  return [...currentPost.commentList, ...autoComments, ...addedComments].sort(
    (a, b) => {
      return getCommentAgeInMinutes(b.time) - getCommentAgeInMinutes(a.time);
    },
  );
};

const getCommentTotalCount = () => {
  return getPostComments().length;
};

const closeProductBoxes = () => {
  detailProductBoxes.forEach((box) => {
    box.classList.remove("active");
    box.setAttribute("aria-hidden", "true");
  });

  detailPlusButtons.forEach((button) => {
    button.setAttribute("aria-expanded", "false");
  });
};

const toggleProductBox = (targetName) => {
  const targetBox = document.querySelector(
    `.detail-product-box[data-product-box="${targetName}"]`,
  );

  const targetButton = document.querySelector(
    `.detail-plus-button[data-product-target="${targetName}"]`,
  );

  if (!targetBox || !targetButton) return;

  const isActive = targetBox.classList.contains("active");

  closeProductBoxes();

  if (!isActive) {
    targetBox.classList.add("active");
    targetBox.setAttribute("aria-hidden", "false");
    targetButton.setAttribute("aria-expanded", "true");
  }
};

const renderPost = () => {
  detailProfileImage.src = currentPost.profileImage;
  detailProfileImage.alt = `${currentPost.author} 프로필`;
  detailAuthor.textContent = currentPost.author;
  detailMeta.textContent = currentPost.meta;
  detailWeather.textContent = currentPost.weather;
  detailPostImage.src = currentPost.postImage;
  detailPostImage.alt = `${currentPost.author}님의 코디 이미지`;

  detailTitle.innerHTML = `
    <span>${currentPost.tag}</span>
    ${currentPost.title}
  `;

  detailBody.textContent = currentPost.body;

  detailPlusButtons.forEach((button) => {
    button.classList.toggle("hidden", currentPost.id !== "post-1");
  });

  detailProductBoxes.forEach((box) => {
    box.classList.remove("active");
    box.setAttribute("aria-hidden", "true");
    box.classList.toggle("hidden", currentPost.id !== "post-1");
  });
};

const renderLike = () => {
  const likedPostIds = getLikedPostIds();
  const isLiked = likedPostIds.includes(currentPost.id);

  detailLikeButton.classList.toggle("active", isLiked);
  detailLikeButton.setAttribute("aria-pressed", isLiked ? "true" : "false");
  detailLikeIcon.src = isLiked
    ? "./images/icons/like-active.png"
    : "./images/icons/like.png";

  detailLikeCount.textContent = getPostLikeCount();
};

const renderCommentCount = () => {
  const count = getCommentTotalCount();

  detailCommentCount.textContent = count;
  detailCommentTitleCount.textContent = `(${count}개)`;
};

const createCommentTemplate = (comment) => {
  if (comment.type === "reply") {
    return `
      <div class="detail-comment-item detail-comment-reply">
        <div class="detail-comment-content">
          <div class="detail-comment-bubble">${comment.text}</div>
          <p class="detail-comment-time">${comment.time}</p>
        </div>
      </div>
    `;
  }

  return `
    <div class="detail-comment-item">
      <div class="detail-comment-profile">
        <img src="${comment.profileImage}" alt="${comment.name} 프로필" />
      </div>

      <div class="detail-comment-content">
        <div class="detail-comment-meta">
          <strong>${comment.name}</strong>
          <span>${comment.time}</span>
        </div>

        <div class="detail-comment-bubble">${comment.text}</div>
      </div>
    </div>
  `;
};

const renderComments = () => {
  const comments = getPostComments();
  const visibleComments = comments.slice(0, visibleCommentCount);

  detailCommentList.innerHTML = visibleComments
    .map((comment) => createCommentTemplate(comment))
    .join("");

  if (visibleCommentCount >= comments.length) {
    detailMoreButton.style.display = "none";
  } else {
    detailMoreButton.style.display = "block";
    detailMoreButton.textContent = "더보기";
  }

  renderCommentCount();
};

const toggleLike = () => {
  const likedPostIds = getLikedPostIds();
  const likeCounts = getSavedLikeCounts();

  const isLiked = likedPostIds.includes(currentPost.id);
  const currentLikeCount = likeCounts[currentPost.id] ?? currentPost.likes;

  let nextLikedPostIds = [];
  let nextLikeCount = currentLikeCount;

  if (isLiked) {
    nextLikedPostIds = likedPostIds.filter((id) => id !== currentPost.id);
    nextLikeCount = Math.max(currentPost.likes, currentLikeCount - 1);
  } else {
    nextLikedPostIds = [...likedPostIds, currentPost.id];
    nextLikeCount = currentLikeCount + 1;
  }

  likeCounts[currentPost.id] = nextLikeCount;

  saveLikedPostIds(nextLikedPostIds);
  saveLikeCounts(likeCounts);

  renderLike();
};

const addComment = () => {
  const value = detailCommentInput.value.trim();

  if (!value) return;

  const myProfile = getMyProfile();
  const savedComments = getSavedComments();
  const targetComments = savedComments[currentPost.id] || [];

  targetComments.push({
    type: "user",
    name: myProfile.name,
    profileImage: myProfile.profileImage,
    time: "방금 전",
    text: value,
  });

  savedComments[currentPost.id] = targetComments;
  saveComments(savedComments);

  detailCommentInput.value = "";

  visibleCommentCount = getPostComments().length;

  renderComments();
};

const sharePost = async () => {
  const shareData = {
    title: `${currentPost.author}님의 코디`,
    text: `${currentPost.tag} ${currentPost.title}`,
    url: window.location.href,
  };

  if (navigator.share) {
    try {
      await navigator.share(shareData);
    } catch (error) {}
    return;
  }

  try {
    await navigator.clipboard.writeText(window.location.href);
    alert("링크가 복사되었습니다.");
  } catch (error) {
    alert("공유 기능을 사용할 수 없습니다.");
  }
};

detailLikeButton.addEventListener("click", toggleLike);

detailMoreButton.addEventListener("click", () => {
  visibleCommentCount += 10;
  renderComments();
});

detailSendButton.addEventListener("click", addComment);

detailCommentInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    addComment();
  }
});

detailShareButton.addEventListener("click", sharePost);

detailPlusButtons.forEach((button) => {
  button.addEventListener("click", (event) => {
    event.stopPropagation();

    if (currentPost.id !== "post-1") return;

    const targetName = button.dataset.productTarget;

    toggleProductBox(targetName);
  });
});

document.addEventListener("click", (event) => {
  const isProductButton = event.target.closest(".detail-plus-button");
  const isProductBox = event.target.closest(".detail-product-box");

  if (isProductButton || isProductBox) return;

  closeProductBoxes();
});

renderPost();
renderLike();
renderComments();
