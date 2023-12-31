let userEmail = "";
let userUuid = "";
//페이지 로드 이벤트
document.addEventListener("DOMContentLoaded", async function () {
  let token = sessionStorage.getItem("token");

  // 토큰이 있을 경우 비회원 이메일 input 안보이게
  if (token) {
    let guestInputBox = document.querySelector(".guestInput-box");
    if (guestInputBox) {
      guestInputBox.style.display = "none";
    }
  } else {
    alert("비회원 주문입니다, 주문정보를 입력해주세요.");
  }
  // 토큰이 있을 경우 로그인 email을 받아옴
  if (token) {
    try {
      const res = await fetch("/api/login", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      });
      const data = await res.json();
      const uuid = data.data.uuid;
      userUuid = data.data.uuid;

      const getUser = await fetch(`/api/users/${uuid}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      });
      const user = await getUser.json();
      userEmail = user.data.email; // 사용자의 이메일을 저장합니다.
    } catch (error) {
      console.error("Fetching user data failed:", error);
    }
    // 토큰이 없을 경우 입력한 email을 받아옴
  } else {
    const guestInput = document.querySelector(".guestInput");
    userEmail = guestInput.value; // 비회원 이메일 input에서 값을 가져옴
  }

  // 주문자, 배송지 정보 가져오기
  fetch(`/api/login`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      authorization: `Bearer ${sessionStorage.getItem("token")}`,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      const uuid = data.data.uuid; // 로그인 후 반환된 UUID

      // 두 번째 fetch 요청 - 사용자 정보 가져오기
      fetch(`/api/users/${uuid}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.json();
        })
        .then((data) => {
          const ordererArea = document.querySelector(".ordererInput");
          ordererArea.value = data.data.name;

          const phoneNumberArea = document.querySelector(".phoneNumberInput");
          phoneNumberArea.value = data.data.phone;

          const orderedAddressInput = document.querySelector(".addressInput");
          orderedAddressInput.value = data.data.address;

          const orderedDetailAddressInput = document.querySelector(".detailAddressInput");
          orderedDetailAddressInput.value = data.data.detail_address;
        })
        .catch((error) => {
          console.log(error);
        });
    })
    .catch((error) => {
      console.log(error);
    });
  //이름, 전화번호 수정 관련 기능
  document.querySelector(".edit-name-btn").addEventListener("click", function () {
    const ordererInput = document.querySelector(".ordererInput");
    if (ordererInput.hasAttribute("readonly")) {
      ordererInput.removeAttribute("readonly");
      ordererInput.addEventListener(
        "blur",
        function () {
          ordererInput.setAttribute("readonly", true);
        },
        { once: true }
      );
    } else {
      ordererInput.setAttribute("readonly", true);
    }
    ordererInput.focus();
  });

  document.querySelector(".edit-phone-btn").addEventListener("click", function () {
    const phoneNumberInput = document.querySelector(".phoneNumberInput");
    if (phoneNumberInput.hasAttribute("readonly")) {
      phoneNumberInput.removeAttribute("readonly");
      phoneNumberInput.addEventListener(
        "blur",
        function () {
          phoneNumberInput.setAttribute("readonly", true);
        },
        { once: true }
      );
    } else {
      phoneNumberInput.setAttribute("readonly", true);
    }
    phoneNumberInput.focus();
  });
  // 전화번호 입력 시 자동 형식 변환 기능
  document.querySelector(".phoneNumberInput").addEventListener("input", function (e) {
    const input = e.target;
    let value = input.value.replace(/\D/g, ""); // 숫자만 남긴다

    if (value.length <= 3) {
      input.value = value;
    } else if (value.length <= 7) {
      input.value = `${value.substr(0, 3)}-${value.substr(3)}`;
    } else {
      input.value = `${value.substr(0, 3)}-${value.substr(3, 4)}-${value.substr(7, 4)}`;
    }

    if (input.value.length > 13) {
      input.value = input.value.slice(0, 13);
    }
  });

  // 배송지 수정 기능
  document.querySelector(".findAddressBtn").addEventListener("click", function () {
    new daum.Postcode({
      oncomplete: function (data) {
        let addr = "";
        let extraAddr = "";

        const address1Input = document.querySelector(".addressInput");
        const address2Input = document.querySelector(".detailAddressInput");

        if (data.userSelectedType === "R") {
          addr = data.roadAddress;
        } else {
          addr = data.jibunAddress;
        }

        if (data.userSelectedType === "R") {
          if (data.bname !== "" && /[동|로|가]$/g.test(data.bname)) {
            extraAddr += data.bname;
          }
          if (data.buildingName !== "" && data.apartment === "Y") {
            extraAddr += extraAddr !== "" ? ", " + data.buildingName : data.buildingName;
          }
          if (extraAddr !== "") {
            extraAddr = " (" + extraAddr + ")";
          }
        }

        address1Input.value = `${addr} ${extraAddr}`;
        address2Input.removeAttribute("readonly");
        address2Input.placeholder = "상세 주소를 입력해 주세요.";
        address2Input.focus();
      },
    }).open();
  });
  const address2Input = document.querySelector(".detailAddressInput");
  // 상세 주소 입력창에서 커서가 떠났을 때 다시 readonly
  address2Input.addEventListener("blur", function () {
    address2Input.setAttribute("readonly", true);
  });

  // 주문 상품 목록, 총 결제 금액
  const orderedList = document.querySelector(".ordered-products-area");
  const totalPriceArea = document.querySelector(".totalPrice");
  const productPriceArea = document.querySelector(".productsPrice");
  const storedCartItems = JSON.parse(localStorage.getItem("cartItems")) || [];
  let totalAmount = 0;
  let productPrice = 0;

  function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  storedCartItems.forEach((item) => {
    const product = `
          <div class="ordered-product-box">
            <div class="ordered-product">
                <h2>${item.name}</h2>
            </div>
            <div class="ordered-product">
              <p> ${item.quantity} 개 / ${item.price} 원</p>
            </div>
          </div>`;
    orderedList.insertAdjacentHTML("beforeend", product);

    productPrice += item.quantity * item.price;
    totalAmount += item.quantity * item.price + 3500;
  });
  productPriceArea.textContent = `${numberWithCommas(productPrice)}원`;
  totalPriceArea.textContent = `${numberWithCommas(totalAmount)}원`;
});

// 결제하기 버튼 클릭 시 서버에 POST 요청 전송
document.querySelector(".purchase-btn").addEventListener("click", function () {
  const ordererInput = document.querySelector(".ordererInput");
  const phoneNumberInput = document.querySelector(".phoneNumberInput");
  const address1Input = document.querySelector(".addressInput");
  const address2Input = document.querySelector(".detailAddressInput");
  const storedCartItems = JSON.parse(localStorage.getItem("cartItems")) || [];

  let selectedPaymentMethod;
  if (document.getElementById("cardPayment").checked) {
    selectedPaymentMethod = "CARD";
  } else if (document.getElementById("bankTransfer").checked) {
    selectedPaymentMethod = "BANK_TRANSFER";
  }

  let totalAmount = 0;

  //totalAmount를 다시 계산합니다.
  storedCartItems.forEach((item) => {
    totalAmount += item.quantity * item.price;
  });

  const orderItems = storedCartItems.map((item) => {
    return {
      quantity: item.quantity,
      unit_price: item.price,
      item_id: item.Item,
      item_name: item.name,
    };
  });

  const orderData = {
    orderItems,
    total_price: totalAmount,
    name: ordererInput.value,
    address: address1Input.value,
    detail_address: address2Input.value,
    phone: phoneNumberInput.value,
    pay_method: selectedPaymentMethod,
    order_status: "ORDER_CONFIRMED",
    email: userEmail,
  };
  //서버에 POST 요청 전송 api
  fetch("/api/order", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      data: orderData,
      uuid: userUuid,
    }),
  })
    .then((response) => {
      console.log("Raw server response:", response);
      return response.json();
    })
    .then((data) => {
      if (data.status === 201) {
        alert("주문이 완료 되었습니다!");
        localStorage.removeItem("cartItems");
        window.location.href = "/";
      } else {
        alert("주문 실패: " + data.message);
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("주문 중 오류가 발생했습니다. 다시 시도해주세요.");
    });
});
