const AllDelBtn = document.querySelector(".Del-Btn");
const cartContainer = document.querySelector(".cart-container");
const MinusBtn = document.querySelectorAll(".btn-minus");
const PlusBtn = document.querySelectorAll(".btn-plus");
const CloseModal = document.querySelector(".close-modal");
const Modal = document.querySelector(".modal");
const ModalImg = document.querySelector(".modal-content");
const BuyBtn = document.querySelector(".btn-buy");

cartContainer.addEventListener("click", function (event) {
  const target = event.target;
  const liElement = target.closest("li");
  const ClosetQty = liElement.querySelector(".input-count");
  const Qty = parseInt(ClosetQty.textContent);

  if (
    target.classList.contains("btn-minus") ||
    target.classList.contains("img-minus")
  ) {
    if (Qty > 1) {
      ClosetQty.textContent = Qty - 1;
      updateCartItemTotal(liElement);
      // 해당 아이템의 수량을 localStorage에서도 업데이트
      updateCartItemLocalStorage(liElement, Qty - 1);
    }
  } else if (
    target.classList.contains("btn-plus") ||
    target.classList.contains("img-plus")
  ) {
    ClosetQty.textContent = Qty + 1;
    updateCartItemTotal(liElement);
    // 해당 아이템의 수량을 localStorage에서도 업데이트
    updateCartItemLocalStorage(liElement, Qty + 1);
  }
});

// 로컬 스토리지에서 해당 아이템의 수량 업데이트
function updateCartItemLocalStorage(cartItem, newQuantity) {
  const storedCartItems = JSON.parse(localStorage.getItem("cartItems")) || [];
  const itemName = cartItem.querySelector(".item-name").textContent;

  // 해당 아이템 찾아서 수량 업데이트
  for (const item of storedCartItems) {
    if (item.name === itemName) {
      item.quantity = newQuantity;
      break;
    }
  }

  // 업데이트된 장바구니 정보를 로컬 스토리지에 저장
  localStorage.setItem("cartItems", JSON.stringify(storedCartItems));
}

// 장바구니 항목의 가격 업데이트를 처리하는 함수
function updateCartItemTotal(cartItem) {
  const itemPriceElement = cartItem.querySelector(".item-price");
  const originalPrice = parseFloat(itemPriceElement.getAttribute("data-price")); // 원래 가격을 속성으로 저장
  const ClosetQty = cartItem.querySelector(".input-count");
  const Qty = parseInt(ClosetQty.textContent);

  // 가격을 원래 가격과 수량에 맞게 업데이트
  const newTotal = originalPrice * Qty;
  itemPriceElement.textContent = newTotal + "원";

  // 아이템 가격의 총 합을 업데이트
  updateItemTotalPrice();
  // 모든 항목의 가격을 더해서 총 가격을 계산
  updateTotalPrice();
}

// 아이템 가격의 총 합을 업데이트하는 함수
function updateItemTotalPrice() {
  const itemPriceElements = document.querySelectorAll(".item-price");
  let totalItemPrice = 0;

  itemPriceElements.forEach(function (itemPriceElement) {
    const priceText = itemPriceElement.textContent;
    const priceNumber = parseFloat(priceText.replace(/[^\d]/g, ""));
    totalItemPrice += priceNumber;
    itemPriceElement.textContent = numberWithCommas(priceNumber) + "원"; // 콤마 추가
  });

  // "item-total-price" 업데이트
  const itemTotalPriceElement = document.querySelector(".item-total-price");
  itemTotalPriceElement.textContent = numberWithCommas(totalItemPrice) + "원";
}

// 모든 항목의 가격을 더한 총 가격을 업데이트하는 함수
function updateTotalPrice() {
  const itemPriceElements = document.querySelectorAll(".item-price");
  let total = 0;

  itemPriceElements.forEach(function (itemPriceElement) {
    const priceText = itemPriceElement.textContent;
    const priceNumber = parseFloat(priceText.replace(/[^\d]/g, ""));
    total += priceNumber;
    itemPriceElement.textContent = numberWithCommas(priceNumber) + "원"; // 콤마 추가
  });

  // 배송료 가져오기
  const deliveryPriceElement = document.querySelector(".delivery-price");
  const deliveryPrice = parseFloat(
    deliveryPriceElement.textContent.replace(/[^\d]/g, "")
  );

  // 총 가격 계산
  total += deliveryPrice;

  // "total-price" 업데이트
  const totalPriceElement = document.querySelector(".total-price");
  totalPriceElement.textContent = numberWithCommas(total) + "원";
}

// 페이지 로드 시 초기 총 가격을 설정
window.addEventListener("load", function () {
  updateItemTotalPrice(); // 아이템 가격의 총 합 설정
  updateTotalPrice(); // 총 가격 설정
});

function createCartItemElement(item) {
  const cartItem = document.createElement("li");
  cartItem.classList.add("cart-item");

  cartItem.innerHTML = `
    <div class="img-box">
      <img class="img-items" src="/${item.image}" alt="" />
    </div>
    <div class="item-info">
      <div class="name-box">
        <a class="item-name" href="#" data-category="${item.category}" data-item="${item.Item}">${item.name}</a>
      </div>
      <div class="count-box">
        <button class="btn-minus" id="btn-minus">
          <img class="img-minus" src="./img/minus.png" alt="" />
        </button>
        <div class="input-count">${item.quantity}</div>
        <button class="btn-plus" id="btn-plus">
          <img class="img-plus" src="./img/plus.png" alt="" />
        </button>
      </div>
      <p class="item-price" data-price="${item.price}">${item.total_price}원</p>
    </div>
    <span class="delete-btn">X</span>
  `;

  // 삭제 이벤트
  const deleteBtn = cartItem.querySelector(".delete-btn");
  deleteBtn.addEventListener("click", function () {
    // 장바구니에서 해당 항목을 삭제하고 로컬 스토리지를 업데이트
    const storedCartItems = JSON.parse(localStorage.getItem("cartItems")) || [];
    const updatedCartItems = storedCartItems.filter(
      (cartItem) => cartItem.name !== item.name
    );
    localStorage.setItem("cartItems", JSON.stringify(updatedCartItems));

    // UI에서 해당 항목을 제거
    const cartContainer = document.querySelector(".cart-container");
    cartContainer.removeChild(cartItem.parentElement.parentElement); // <ul> 요소를 제거
  });

  // 링크 이동 이벤트
  const itemNameLink = cartItem.querySelector(".item-name");
  // 클릭 이벤트 리스너를 추가
  itemNameLink.addEventListener("click", function (e) {
    e.preventDefault(); // 기본 동작 방지
    const categoryId = itemNameLink.getAttribute("data-category");
    const itemId = itemNameLink.getAttribute("data-item");
    const detailPageURL = `/detailpage/detailpage.html?category=${categoryId}&item=${itemId}`;
    window.location.href = detailPageURL;
  });

  //모달 창 이벤트
  const Imgs = cartItem.querySelectorAll(".img-items");
  Imgs.forEach(function (Img) {
    Img.addEventListener("click", function () {
      Modal.style.display = "flex";
      ModalImg.src = this.src;
    });
  });

  CloseModal.addEventListener("click", function () {
    Modal.style.display = "none";
  });

  document.addEventListener("keydown", handleEscKey);

  // 모달 외부 클릭 시 모달 닫기
  window.onclick = function (event) {
    if (event.target == Modal) {
      Modal.style.display = "none";
    }
  };

  return cartItem;
}

function updateCartUI() {
  // 로컬 스토리지에서 장바구니 항목을 가져옵니다.
  const storedCartItems = JSON.parse(localStorage.getItem("cartItems")) || [];

  // cart-container 요소를 선택합니다.
  const cartContainer = document.querySelector(".cart-container");

  // 기존의 내용을 비웁니다.
  cartContainer.innerHTML = "";

  // 장바구니 항목들을 순회하면서 HTML 요소를 생성하고 추가합니다.
  for (const item of storedCartItems) {
    const cartList = document.createElement("ul");
    cartList.id = "cart-list";
    const cartItem = createCartItemElement(item);
    const listItem = document.createElement("li");
    listItem.appendChild(cartItem);
    cartList.appendChild(listItem);
    cartContainer.appendChild(cartList);
  }
}

AllDelBtn.addEventListener("click", function () {
  // 확인 대화 상자를 표시
  const confirmResult = window.confirm("장바구니를 비우시겠습니까?");

  // 확인을 클릭한 경우만 로컬 스토리지에서 모든 cartItems를 삭제하고 UI에서 모든 항목을 제거
  if (confirmResult) {
    // 로컬 스토리지에서 모든 cartItems를 삭제
    localStorage.removeItem("cartItems");

    // UI에서 모든 항목을 제거
    const cartContainer = document.querySelector(".cart-container");
    cartContainer.innerHTML = "";
    location.reload();
  }
});

// 페이지 로드 시 UI 업데이트를 호출하여 기존 장바구니 항목을 표시합니다.
updateCartUI();

function handleEscKey(event) {
  if (event.key === "Escape") {
    Modal.style.display = "none";
  }
}

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
