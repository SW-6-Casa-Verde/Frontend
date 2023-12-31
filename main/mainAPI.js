const URL = "/api";

// 카테고리 목록을 가져오는 요청을 보냅니다.
fetch(`/api/categories`)
  .then((res) => {
    if (!res.ok) {
      throw new Error("Network response was not ok");
    }
    return res.json();
  })
  .then((response) => {
    const categories = response.categories;

    categories.sort((a, b) => a.id - b.id);

    categories.forEach((category) => {
      const categoryURL = `/api/categories/${category.id}/items?sort=인기순`;

      fetch(categoryURL)
        .then((res) => {
          if (!res.ok) {
            throw new Error("Network response was not ok");
          }
          return res.json();
        })
        .then((data) => {
          PopularItem(data);
        })
        .catch((error) => {
          console.log(error);
        });
    });
  })
  .catch((error) => {
    console.log(error);
  });

function PopularItem(data) {
  // API 데이터를 그룹화하기 위한 객체를 생성합니다.
  const categoryDataMap = {};

  // API 데이터를 순회하면서 카테고리 ID를 기준으로 그룹화합니다.
  data.items.forEach((item) => {
    const categoryId = item.category.id;

    if (!categoryDataMap[categoryId]) {
      categoryDataMap[categoryId] = [];
    }
    categoryDataMap[categoryId].push(item);
  });

  // PopularContainer를 가져옵니다.
  const PopularContainer = document.querySelector(".PopularContainer");

  // 그룹화된 데이터를 순회하면서 각 카테고리에 대한 섹션을 생성합니다.
  for (const categoryId in categoryDataMap) {
    const categoryItems = categoryDataMap[categoryId];

    // 카테고리에 대한 section을 생성합니다.
    const CategorySection = document.createElement("section");
    CategorySection.classList.add("Popular");

    // 카테고리 이름을 section에 추가합니다. (예: 'POPULAR POT')
    CategorySection.innerHTML = `
    <div class="Product_Tiitle">
      <div class="Eng_Title">POPULAR ${categoryItems[0].category.name}</div>
      <div class="KR_Title">이달의 인기상품</div>
    </div>
  `;

    // Product_Col을 생성합니다.
    const ProductCol = document.createElement("div");
    ProductCol.classList.add("Product_Col");
    CategorySection.appendChild(ProductCol);

    // 각 카테고리에서 data.sales 값을 기준으로 아이템 정렬
    categoryItems.sort((a, b) => Number(b.sales) - Number(a.sales));
    console.log(categoryItems);

    // 각 카테고리에서 최대 3개의 아이템을 보여줍니다.
    for (let i = 0; i < Math.min(3, categoryItems.length); i++) {
      const Item = categoryItems[i];
      const itemName = Item.name.replace(/"/g, ""); // 큰따옴표 제거
      const Product = document.createElement("div");
      Product.classList.add("Popular_Product");
      const firstImageUrl = `url(/${Item.main_images[1]})`;
      const secondImageUrl = `url(/${Item.main_images[0]})`;
      Product.innerHTML = `
      <div class="Product_Img">
        <div class="first_Img" style="background-image: ${firstImageUrl};"></div>
        <div class="second_Img" style="background-image: ${secondImageUrl};"></div>
      </div>
      <div class="Product_Name">${itemName}</div>
      <div class="Product_Price">${numberWithCommas(Item.price)} 원</div>
    `;

      // Product를 Product_Col에 추가합니다.
      ProductCol.appendChild(Product);

      Product.onclick = function (event) {
        // 클릭한 Product의 id 값을 가져옵니다.
        const clickedItemId = Item.id;
        const clickedCategoryId = Item.category.id;

        // 클릭한 Product의 id를 사용하여 상세 페이지로 이동할 URL을 생성합니다.
        window.location.href = `/detail?category=${clickedCategoryId}&item=${clickedItemId}`;
      };
    }

    // PopularContainer에 카테고리 section을 추가합니다.
    PopularContainer.appendChild(CategorySection);
  }
}

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
