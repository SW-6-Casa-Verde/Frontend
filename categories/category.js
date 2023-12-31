const ItemImage = document.querySelector(".container_image");

qs = new URLSearchParams(window.location.search);
qs.get("category");
qs.get("item");
const categoryId = qs.get("category");
const ItemId = qs.get("item");

const URL = "/api";
fetch(`${URL}/categories/${categoryId}/items?perPage=30`, {
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
    ItemCategory(data);
  })
  .catch((error) => {
    console.log(error);
  });

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function ItemCategory(data) {
  const ProductColContainer = document.querySelector(".Product_Col_Container");
  let ProductColCount = 0;
  let ProductCol = CreateProductCol();

  // 클릭한 카테고리에 해당하는 상품 데이터를 가져온 데이터로 대체합니다.
  const categoryItems = data.items;

  for (let j = 0; j < categoryItems.length; j++) {
    let ItemInfo = categoryItems[j];
    const firstImageUrl = `url(/${ItemInfo.main_images[1].replace(/\s/g, "")})`;
    const secondImageUrl = `url(/${ItemInfo.main_images[0].replace(/\s/g, "")})`;

    const Product = document.createElement("div");
    Product.innerHTML = `<div class="Product">
      <div class="Product_Img">
        <div class="first_Img" style="background-image: ${firstImageUrl};"></div>
        <div class="second_Img" style="background-image: ${secondImageUrl};"></div>
      </div>
      <div class="Product_Name">${ItemInfo.name}</div>
      <div class="Product_Price">${numberWithCommas(ItemInfo.price)} 원</div>
    </div>`;
    ProductCol.appendChild(Product);

    if (++ProductColCount === 3) {
      ProductColContainer.appendChild(ProductCol); // 현재의 ProductCol을 문서에 추가
      ProductCol = CreateProductCol(); // 새로운 ProductCol 생성
      ProductColCount = 0; // ProductCol 개수 초기화
    }

    Product.onclick = function (event) {
      // 클릭한 Product의 id 값을 가져옵니다.
      const clickedItemId = ItemInfo.id;

      // 클릭한 Product의 id를 사용하여 상세 페이지로 이동할 URL을 생성합니다.
      window.location.href = `/detail?category=${categoryId}&item=${clickedItemId}`;
    };
  }

  if (ProductColCount > 0) {
    ProductColContainer.appendChild(ProductCol);
  }
}

function CreateProductCol() {
  const ProductCol = document.createElement("div");
  ProductCol.className = "Product_Col"; // 원하는 클래스 이름을 여기에 설정하세요.
  return ProductCol;
}
