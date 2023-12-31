document.addEventListener("DOMContentLoaded", function () {
  const MinusBtn = document.querySelector(".btn-minus");
  const PlusBtn = document.querySelector(".btn-plus");
  const Qty = document.querySelector(".input-count");
  const Price = document.querySelector(".item-price");
  const CartBtn = document.querySelector(".order_save_button");
  const ContainerImage = document.querySelector(".container_image");
  const Sales = document.querySelector(".product_rate_star");
  const BuyBtn = document.querySelector(".order_buy_button");

  const ProductName = document.querySelector(".product_name");
  const ProductPrice = document.querySelector(".product_price");
  const Description = document.querySelector(".company_mindset_text");
  const TotalPrice = document.querySelector(".item-price");

  const qs = new URLSearchParams(window.location.search);
  const categoryId = qs.get("category");
  const ItemId = qs.get("item");
  const URL = "/api";
  console.log(categoryId, ItemId);

  // 카테고리 목록을 가져오는 요청을 보냅니다.
  fetch(`${URL}/categories/${categoryId}/items/${ItemId}`, {
    method: "GET",
    headers: {
      Origin: `${URL}`, // 클라이언트의 도메인
      // 기타 헤더 설정
    },
    credentials: "include", // credentials 옵션을 include로 설정
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error("Network response was not ok");
      }
      return res.json();
    })
    .then((data) => {
      const ItemInfo = data.item;
      console.log(ItemInfo);
      ProductName.textContent = `${ItemInfo.name}`;
      ProductPrice.textContent = `${numberWithCommas(ItemInfo.price)} 원`;
      Description.textContent = `${ItemInfo.description}`;
      TotalPrice.textContent = `${numberWithCommas(ItemInfo.price)} 원`;
      Sales.textContent = `판매량 (${ItemInfo.sales})`;

      // 이미지 컨테이너 초기화
      ContainerImage.innerHTML = "";

      for (let i = 0; i < ItemInfo.images.length; i++) {
        // 이미지 요소를 만들고 소스를 설정합니다.
        const imgElement = document.createElement("img");
        imgElement.src = `/${ItemInfo.images[i]}`;
        imgElement.alt = "";
        ContainerImage.appendChild(imgElement);
      }

      CartBtn.addEventListener("click", function () {
        const storedCartItems =
          JSON.parse(localStorage.getItem("cartItems")) || [];

        // 현재 상품 정보를 담을 객체 생성
        const itemInfo = {
          image: ItemInfo.main_images[0],
          name: ItemInfo.name,
          price: ItemInfo.price,
          category: categoryId,
          Item: ItemId,
          object_id: ItemInfo._id,
          quantity: parseInt(Qty.textContent), // 현재 input-count의 값을 가져옴
          total_price: TotalPrice.textContent.replace(" 원", ""),
        };

        // 이미 장바구니에 같은 상품이 있는지 확인
        const existingItemIndex = storedCartItems.findIndex((cartItem) => {
          return (
            cartItem.name === itemInfo.name &&
            cartItem.category === categoryId &&
            cartItem.Item === ItemId
          );
        });

        if (existingItemIndex !== -1) {
          // 이미 장바구니에 같은 상품이 있는 경우, 수량 증가 또는 다른 조치를 취할 수 있음
          alert("이미 장바구니에 있는 제품입니다.");
        } else {
          // 이미 장바구니에 같은 상품이 없는 경우, 새로운 상품 추가
          storedCartItems.push(itemInfo);
          alert("장바구니에 상품이 추가 되었습니다.");
        }

        // 다시 로컬 스토리지에 저장
        localStorage.setItem("cartItems", JSON.stringify(storedCartItems));

        // 저장 완료 메시지 또는 원하는 작업을 수행할 수 있습니다.
        console.log("상품 정보가 장바구니에 추가되었습니다.");
      });

      BuyBtn.addEventListener("click", function () {
        const storedCartItems =
          JSON.parse(localStorage.getItem("cartItems")) || [];

        // 현재 상품 정보를 담을 객체 생성
        const itemInfo = {
          image: ItemInfo.main_images[0],
          name: ItemInfo.name,
          price: ItemInfo.price,
          object_id: ItemInfo._id,
          Item: ItemId,
          object_id: ItemInfo._id,
          quantity: parseInt(Qty.textContent), // 현재 input-count의 값을 가져옴
          total_price: TotalPrice.textContent.replace(" 원", ""),
        };

        // 이미 장바구니에 같은 상품이 있는지 확인
        const existingItemIndex = storedCartItems.findIndex((cartItem) => {
          return (
            cartItem.name === itemInfo.name &&
            cartItem.category === categoryId &&
            cartItem.Item === ItemId
          );
        });

        if (existingItemIndex !== -1) {
          // 이미 장바구니에 같은 상품이 있는 경우, 수량 증가 또는 다른 조치를 취할 수 있음
          alert("이미 장바구니에 있는 제품입니다.");
        } else {
          // 이미 장바구니에 같은 상품이 없는 경우, 새로운 상품 추가
          storedCartItems.push(itemInfo);
        }

        // 다시 로컬 스토리지에 저장
        localStorage.setItem("cartItems", JSON.stringify(storedCartItems));

        // 저장 완료 메시지 또는 원하는 작업을 수행할 수 있습니다.
        console.log("상품 정보가 장바구니에 추가되었습니다.");
      });

      // 현재 수량을 가져오는 함수
      function getCurrentQuantity() {
        return parseInt(Qty.textContent);
      }

      // 더하기 버튼 이벤트 리스너
      PlusBtn.addEventListener("click", function () {
        // 현재 수량을 가져온 후 1을 더하고 화면에 업데이트
        const currentQty = getCurrentQuantity();
        Qty.textContent = currentQty + 1;
        updateItemPrice(currentQty + 1); // 수량 증가에 따른 가격 업데이트
      });

      // 빼기 버튼 이벤트 리스너
      MinusBtn.addEventListener("click", function () {
        // 현재 수량을 가져온 후 1을 뺀 값이 1 이상이면 화면에 업데이트
        const currentQty = getCurrentQuantity();
        if (currentQty > 1) {
          Qty.textContent = currentQty - 1;
          updateItemPrice(currentQty - 1); // 수량 감소에 따른 가격 업데이트
        }
      });

      function updateItemPrice(quantity) {
        const priceText = ProductPrice.textContent; // "30,000원"과 같은 문자열
        const priceNumber = parseFloat(priceText.replace(/[^\d]/g, "")); // 숫자 추출 및 콤마 제거
        const totalPrice = priceNumber * quantity;
        TotalPrice.textContent = `${numberWithCommas(totalPrice)} 원`; // 다시 콤마를 추가하여 표시
      }

      function numberWithCommas(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      }
    })
    .catch((error) => {
      console.log(error);
    });
});
