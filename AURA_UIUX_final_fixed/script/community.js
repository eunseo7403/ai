const COMMUNITY_LIKED_KEY = "auraCommunityLikedPosts";
const COMMUNITY_LIKE_COUNTS_KEY = "auraCommunityLikeCounts";

const communityTabs = document.querySelectorAll(".community-tab");
const communityList = document.getElementById("communityList");
const communityMoreButton = document.getElementById("communityMoreButton");
const communityEmptyMessage = document.getElementById("communityEmptyMessage");

let currentFilter = "recent";
let visibleCount = 3;

const communityPosts = [
  {
    id: "post-1",
    author: "김지수",
    meta: "30분 전 · 경기 김포",
    weather: "10° 흐림",
    profileImage: "./images/icons/profile03.png",
    postImage:
      "https://unsplash.com/photos/nimElTcTNyY/download?force=true&w=640",
    tag: "#OOTD",
    text: "이런날엔 특색있는 노란 후드티를 입어줘야합니다!!",
    likes: 150,
    comments: 18,
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
    text: "맑은날에 원피스로 기분 전환 해보세요.",
    likes: 50,
    comments: 3,
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
    text: "요새는 이런 스타일링이 감각있어 보입니다.",
    likes: 300,
    comments: 150,
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
    text: "가벼운 자켓 하나로 완성한 주말 코디예요.",
    likes: 89,
    comments: 12,
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
    text: "차분한 톤으로 맞춘 오늘의 미니멀 룩입니다.",
    likes: 210,
    comments: 34,
  },
];

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

const getPostLikeCount = (post) => {
  const savedLikeCounts = getSavedLikeCounts();

  return savedLikeCounts[post.id] ?? post.likes;
};

const getFilteredPosts = () => {
  const likedPostIds = getLikedPostIds();

  if (currentFilter === "liked") {
    return communityPosts.filter((post) => likedPostIds.includes(post.id));
  }

  if (currentFilter === "popular") {
    return [...communityPosts].sort((a, b) => {
      return getPostLikeCount(b) - getPostLikeCount(a);
    });
  }

  return [...communityPosts];
};

const goToCommunityDetail = (postId) => {
  window.location.href = `./community-detail.html?id=${postId}`;
};

const createPostCard = (post) => {
  const likedPostIds = getLikedPostIds();
  const isLiked = likedPostIds.includes(post.id);
  const likeCount = getPostLikeCount(post);

  const article = document.createElement("article");
  article.className = "community-card";
  article.dataset.postId = post.id;

  // 커뮤니티 카드 전체를 키보드로도 접근 가능하게 설정
  article.setAttribute("role", "link");
  article.setAttribute("tabindex", "0");
  article.setAttribute(
    "aria-label",
    `${post.author}님의 코디 게시글 상세 보기`,
  );

  article.innerHTML = `
    <div class="community-card-top">
      <div class="community-profile">
        <div class="community-profile-img">
          <img src="${post.profileImage}" alt="${post.author} 프로필" />
        </div>

        <div class="community-profile-info">
          <strong>${post.author}</strong>
          <span>${post.meta}</span>
        </div>
      </div>

      <span class="community-weather">${post.weather}</span>
    </div>

    <div class="community-post-img">
      <img src="${post.postImage}" alt="${post.author}님의 코디 이미지" />
    </div>

    <p class="community-post-text">
      <strong>${post.tag}</strong>
      ${post.text}
    </p>

    <div class="community-actions">
      <button
        type="button"
        class="community-action-button community-like-button ${isLiked ? "liked" : ""}"
        data-post-id="${post.id}"
        aria-label="좋아요"
        aria-pressed="${isLiked}"
      >
        <img
          src="${isLiked ? "./images/icons/like-active.png" : "./images/icons/like.png"}"
          alt=""
        />
        <span>${likeCount}</span>
      </button>

      <button
        type="button"
        class="community-action-button community-comment-button"
        aria-label="댓글"
      >
        <img src="./images/icons/chat.png" alt="" />
        <span>${post.comments}</span>
      </button>

      <button
        type="button"
        class="community-action-button community-share-button"
        aria-label="공유"
        data-post-id="${post.id}"
      >
        <img src="./images/icons/share.png" alt="" />
        <span>공유</span>
      </button>
    </div>
  `;

  return article;
};

const renderCommunityPosts = () => {
  const filteredPosts = getFilteredPosts();
  const visiblePosts = filteredPosts.slice(0, visibleCount);

  communityList.innerHTML = "";

  visiblePosts.forEach((post) => {
    const card = createPostCard(post);
    communityList.appendChild(card);
  });

  const isEmpty = filteredPosts.length === 0;

  communityEmptyMessage.classList.toggle("hidden", !isEmpty);
  communityMoreButton.classList.toggle(
    "hidden",
    isEmpty || visibleCount >= filteredPosts.length,
  );
};

const togglePostLike = (postId) => {
  const likedPostIds = getLikedPostIds();
  const likeCounts = getSavedLikeCounts();

  const post = communityPosts.find((item) => item.id === postId);

  if (!post) return;

  const currentLikeCount = likeCounts[postId] ?? post.likes;
  const isLiked = likedPostIds.includes(postId);

  let nextLikedPostIds = [];
  let nextLikeCount = currentLikeCount;

  if (isLiked) {
    nextLikedPostIds = likedPostIds.filter((id) => id !== postId);
    nextLikeCount = Math.max(post.likes, currentLikeCount - 1);
  } else {
    nextLikedPostIds = [...likedPostIds, postId];
    nextLikeCount = currentLikeCount + 1;
  }

  likeCounts[postId] = nextLikeCount;

  saveLikedPostIds(nextLikedPostIds);
  saveLikeCounts(likeCounts);

  renderCommunityPosts();
};

const sharePost = async (postId) => {
  const post = communityPosts.find((item) => item.id === postId);

  if (!post) return;

  const shareUrl = `${window.location.origin}${window.location.pathname.replace(
    "community.html",
    "community-detail.html",
  )}?id=${post.id}`;

  const shareData = {
    title: `${post.author}님의 코디`,
    text: `${post.tag} ${post.text}`,
    url: shareUrl,
  };

  if (navigator.share) {
    try {
      await navigator.share(shareData);
    } catch (error) {}
    return;
  }

  try {
    await navigator.clipboard.writeText(shareUrl);
    alert("링크가 복사되었습니다.");
  } catch (error) {
    alert("공유 기능을 사용할 수 없습니다.");
  }
};

communityTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    communityTabs.forEach((item) => {
      item.classList.remove("active");
      item.setAttribute("aria-selected", "false");
    });

    tab.classList.add("active");
    tab.setAttribute("aria-selected", "true");
    currentFilter = tab.dataset.filter;
    visibleCount = 3;

    renderCommunityPosts();
  });
});

communityList.addEventListener("keydown", (event) => {
  const card = event.target.closest(".community-card");

  if (!card || (event.key !== "Enter" && event.key !== " ")) return;

  if (event.target.closest("button")) return;

  event.preventDefault();
  goToCommunityDetail(card.dataset.postId);
});

communityList.addEventListener("click", (event) => {
  const likeButton = event.target.closest(".community-like-button");
  const shareButton = event.target.closest(".community-share-button");
  const commentButton = event.target.closest(".community-comment-button");
  const card = event.target.closest(".community-card");

  if (likeButton) {
    const postId = likeButton.dataset.postId;

    togglePostLike(postId);
    return;
  }

  if (shareButton) {
    const postId = shareButton.dataset.postId;

    sharePost(postId);
    return;
  }

  if (commentButton) {
    if (!card) return;

    goToCommunityDetail(card.dataset.postId);
    return;
  }

  if (!card) return;

  goToCommunityDetail(card.dataset.postId);
});

communityMoreButton.addEventListener("click", () => {
  visibleCount += 2;
  renderCommunityPosts();
});

renderCommunityPosts();
