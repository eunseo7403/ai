const profileName = document.querySelector(".profile-name-row h2");
const profileEditButton = document.querySelector(".profile-edit-button");

const NICKNAME_KEY = "auraNickname";

// 저장된 닉네임이 있으면 화면에 반영
const savedNickname = localStorage.getItem(NICKNAME_KEY);

if (savedNickname) {
  profileName.textContent = savedNickname;
}

// 연필 아이콘 클릭 시 닉네임 변경
profileEditButton.addEventListener("click", () => {
  const currentName = profileName.textContent;

  const newNickname = prompt("변경할 닉네임을 입력해주세요.", currentName);

  // 취소를 누르면 아무것도 하지 않음
  if (newNickname === null) {
    return;
  }

  const trimmedNickname = newNickname.trim();

  // 빈 값 방지
  if (trimmedNickname === "") {
    alert("닉네임을 입력해주세요.");
    return;
  }

  // 화면에 반영
  profileName.textContent = trimmedNickname;

  // 브라우저에 저장
  localStorage.setItem(NICKNAME_KEY, trimmedNickname);
});
