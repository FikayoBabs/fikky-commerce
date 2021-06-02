//variables
const searchForm = document.querySelector("#search-form");
const searchFormInput = document.querySelector("#inputSearch");
const cartBtn = document.querySelector('.cart-btn');
const closeCartBtn = document.querySelector('.close-cart');
const clearCartBtn = document.querySelector('.clear-cart');
const cartDOM = document.querySelector('.cart');
const cartOverlay = document.querySelector('.cart-overlay');
const cartItems = document.querySelector('.cart-items');
const cartTotal = document.querySelector('.cart-total');
const cartContent = document.querySelector('.cart-content');
const productsDOM = document.querySelector('.products-center');
// cart 
let cart = [];

//buttons
let buttonsDOM = [];

//speech things
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition; // if none exists -> undefined

// <!-- <button type="button"><i class="fas fa-microphone"></i></button> -->
if(SpeechRecognition) {
    console.log("Your Browser supports speech Recognition");
    
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    // recognition.lang = "en-US";
  
    searchForm.insertAdjacentHTML("beforeend", '<button id = "voiceSearch" type="button"><i class="fas fa-microphone"></i></button>');
    searchFormInput.style.paddingRight = "50px";
  
    const micBtn = searchForm.querySelector("#voiceSearch");
    const micIcon = micBtn.firstElementChild;
  
    micBtn.addEventListener("click", micBtnClick);
    function micBtnClick() {
      if(micIcon.classList.contains("fa-microphone")) { // Start Voice Recognition
        recognition.start(); // First time you have to allow access to mic!
      }
      else {
        recognition.stop();
      }
    }
  
    recognition.addEventListener("start", startSpeechRecognition); // <=> recognition.onstart = function() {...}
    function startSpeechRecognition() {
      micIcon.classList.remove("fa-microphone");
      micIcon.classList.add("fa-microphone-slash");
      searchFormInput.focus();
      alert("Voice activated, SPEAK");
    }
  
    recognition.addEventListener("end", endSpeechRecognition); // <=> recognition.onend = function() {...}
    function endSpeechRecognition() {
      micIcon.classList.remove("fa-microphone-slash");
      micIcon.classList.add("fa-microphone");
      searchFormInput.focus();
      alert("Speech recognition service disconnected");
    }

    recognition.addEventListener("result", endSpeechRecognition); // <=> recognition.onend = function() {...}
    function endSpeechRecognition() {
      micIcon.classList.remove("fa-microphone-slash");
      micIcon.classList.add("fa-microphone");
      searchFormInput.focus();
      recognition.stop();
    //   alert("Speech recognition service disconnected");
    }
    
    // textSeacrh things//
    searchForm.querySelector("#textSearch").addEventListener('click', (event) =>{
        event.preventDefault();
        if(searchFormInput.value != null ||searchFormInput.value != undefined ){
           
            const ui = new UI()
            const products = new Products();
              // setup app
            //   ui.setupAPP();
            // get all prodcuts
            products.getProducts().then(products => {
                ui.displaySearchProducts(products,searchFormInput.value.toLowerCase().trim());
                Storage.saveProducts(products);
        });
          }
    });



    recognition.addEventListener("result", resultOfSpeechRecognition); // <=> recognition.onresult = function(event) {...} - Fires when you stop talking
    function resultOfSpeechRecognition(event) {
      const current = event.resultIndex;
      let transcript = event.results[current][0].transcript;

      if(transcript != null ||transcript != undefined ){
        searchFormInput.value = transcript;
        const ui = new UI()
        const products = new Products();
          // setup app
        //   ui.setupAPP();
        // get all prodcuts
        products.getProducts().then(products => {
            ui.displaySearchProducts(products,transcript.toLowerCase().trim());
            Storage.saveProducts(products);
    });
      }
      
  
      // searchFormInput.value = transcript;
      // searchFormInput.focus();
      // setTimeout(() => {
      //   searchForm.submit();
      // }, 500);
    }
    
    // info.textContent = 'Voice Commands: "stop recording", "reset input", "go"';
    
  }
  else {
    console.log("Your Browser does not support speech Recognition");
    // info.textContent = "Your Browser does not support Speech Recognition";
  }

//getting the products
class Products{
async getProducts(){
    try {
        let result = await  fetch('products.json')
        let data = await result.json();

        let products = data.items;
        products = products.map(item =>{
            const {title,price} = item.fields;
            const {id} = item.sys;
            const image = item.fields.image.fields.file.url;
            return {title,price,id,image};
        })
        return products
    } catch (error) {
       console.log(error); 
    }
  
}
}
//display products
class UI {
    displaySearchProducts(products,filter){
        let result = "";
        products.forEach(product => {
           
          if(product.title.includes(filter) ){
            result += `
            <!--- single products -->
            <article class="products">
            <div class="img-container">
                <img src=${product.image} alt="product" 
                class="product-img">
                <button class="bag-btn" data-id=${product.id}>
           <i class="fas fa-shopping-cart"></i>
           add to cart 
                </button>
            </div>
            <h3>${product.title}</h3>
            <h4>$${product.price}</h4> 
        </article> 
        <!---end of single product -->  
            `;
          }
            
           
        
           
        });
         productsDOM.innerHTML = result;
           }


   displayProducts(products){
let result = "";
products.forEach(product => {
   
        result += `
        <!--- single products -->
        <article class="products">
        <div class="img-container">
            <img src=${product.image} alt="product" 
            class="product-img">
            <button class="bag-btn" data-id=${product.id}>
       <i class="fas fa-shopping-cart"></i>
       add to cart 
            </button>
        </div>
        <h3>${product.title}</h3>
        <h4>$${product.price}</h4> 
    </article> 
    <!---end of single product -->  
        `;
    
   

   
});
 productsDOM.innerHTML = result;
   }
   getBagButtons(){
      const buttons = [...document.querySelectorAll(".bag-btn")
    ];
    buttonsDOM = buttons;
   buttons.forEach(button =>{
       let id = button.dataset.id;
       let inCart = cart.find(item => item.id === id);
       if(inCart){
           button.innerText = "In Cart";
           button.disabled = true
       }
       
           button.addEventListener('click', event =>{
        event.target.innerText = "In Cart";
        event.target.disabled = true;
          // get product from products
        let cartItem = {...Storage.getProduct(id),
        amount:1 };
          // add products to the cart
          cart = [...cart,cartItem];
          // save cart in local storage
          Storage.saveCart(cart);
          // set cart values
          this.setCartValues(cart);
          // display cart item
          this.addCartItem(cartItem);
          // show the cart
          this.showCart();
    });
       
   });
   }
   setCartValues(cart){
       let tempTotal = 0;
       let itemsTotal = 0;
       cart.map(item =>{
           tempTotal += item.price * item.amount;
        itemsTotal += item.amount;       
        })
        cartTotal.innerText = parseFloat(tempTotal.toFixed
            (2))
           cartItems.innerText = itemsTotal; 
        }
        addCartItem(item){
        const div = document.createElement('div');
        div.classList.add('cart-item');
        div.innerHTML = `<img src=${item.image}
        alt="product">
        <div>
            <h4>${item.title}</h4>
            <h5>$${item.price}</h5>
            <span class="remove-item" data-id =
            ${item.id}>remove</span>
        </div>
        <div>
            <i class="fas fa-chevron-up" data-id =
            ${item.id}></i>
            <p class="item-amount">${item.amount}</p>
            <i class="fas fa-chevron-down" data-id =
            ${item.id}></i>
        </div>`;
        cartContent.appendChild(div);
        
        }
        showCart(){
     cartOverlay.classList.add('transparentBcg');
     cartDOM.classList.add('showCart');
        }
     setupAPP() {
         cart = Storage.getCart();
         this.setCartValues(cart);
         this.populateCart(cart);
         cartBtn.addEventListener('click',this.showCart);
         closeCartBtn.addEventListener('click',this.hideCart);
     }   
     populateCart(cart){
         cart.forEach(item =>this.addCartItem(item));
     }
     hideCart(){
         cartOverlay.classList.remove("transparentBcg");
         cartDOM.classList.remove("showCart");
     }   
     cartLogic(){
         // clear cart button
         clearCartBtn.addEventListener('click', () => {
             this.clearCart();
         });
         // cart functionality
         cartContent.addEventListener('click', event =>{
        if(event.target.classList.contains('remove-item'))
        {
         let removeItem = event.target;
         let id = removeItem.dataset.id;
         cartContent.removeChild
         (removeItem.parentElement.parentElement);
         this.removeItem(id);
        }
        else if(event.target.classList.contains("fa-chevron-up")){
        let addAmount = event.target;
        let id = addAmount.dataset.id; 
        let tempItem = cart.find(item => item.id===id);
        tempItem.amount = tempItem.amount + 1;
        Storage.saveCart(cart);
        this.setCartValues(cart);
        addAmount.nextElementSibling.innerText = 
        tempItem.amount;  
    }
    else if (event.target.classList.contains
        ("fa-chevron-down")){
            let lowerAmount = event.target;
            let id = lowerAmount.dataset.id;
            let tempItem = cart.find(item => item.id === id);
            tempItem.amount = tempItem.amount - 1;
            if(tempItem.amount > 0){
            Storage.saveCart(cart);
            this.setCartValues(cart);
            lowerAmount.previousElementSibling.innerText =
            tempItem.amount;
            }
            else{
                cartContent.removeChild
                (lowerAmount.parentElement.parentElement);
                this.removeItem(id)
            }
        }
         });
     }  
     clearCart(){
         let cartItems = cart.map(item => item.id);
         cartItems.forEach(id => this.removeItem(id));
         console.log(cartContent.children);

         while(cartContent.children.length>0){
             cartContent.removeChild(cartContent.children[0])
         } 
         this.hideCart();    
        }
     removeItem(id){
         cart = cart.filter(item => item.id !==id);
         this.setCartValues(cart);
         Storage.saveCart(cart);
         let button = this.getSingleButton(id);
         button.disabled = false;
         button.innerHTML = `<i class= "fas
         fa-shopping-cart"></i>add to cart`;
     }
     getSingleButton(id){
         return buttonsDOM.find(button => button.dataset.id
            === id);
     }
}
//local storage
class Storage{
  static saveProducts(products){
      localStorage.setItem("products", JSON.stringify(products)
      );
  }
  static getProduct(id){
      let products = JSON.parse(localStorage.getItem
        ('products'));
        return products.find(product => product.id === id)
  }
  static saveCart(cart){
      localStorage.setItem('cart',JSON.stringify(cart));
  }
  static getCart(){
      return localStorage.getItem('cart')?JSON.parse
      (localStorage.getItem('cart')): []
  }
}

document.addEventListener("DOMContentLoaded", () => {
  
  const ui = new UI()
    const products = new Products();
      // setup app
      ui.setupAPP();
    // get all prodcuts
    products.getProducts().then(products => {
        ui.displayProducts(products);
        Storage.saveProducts(products);
})
.then(() => {
    ui.getBagButtons();
    ui.cartLogic();
}); 
});