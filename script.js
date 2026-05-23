const inputField = document.querySelector('.input-add');
const addButton = document.querySelector('.btn-add');
const itemsList = document.querySelector('.items-list');

const leftItemsContainer = document.querySelector('.stats-section:nth-child(1) .stats-items');
const boughtItemsContainer = document.querySelector('.stats-section:nth-child(2) .stats-items');

function updateStatistics() {
    leftItemsContainer.innerHTML = '';
    boughtItemsContainer.innerHTML = '';

    const items = itemsList.querySelectorAll('.item');

    items.forEach(item => {
        const nameSpan = item.querySelector('.item-name');
        const editInput = item.querySelector('.item-edit-input');
        const name = nameSpan ? nameSpan.textContent : editInput.value;

        const quantity = item.querySelector('.item-quantity').textContent;

        const isBought = nameSpan && nameSpan.classList.contains('strike-through');

        if (isBought) {
            const badgeHTML = `<span class="stat-badge"><span class="strike-through">${name}</span> <span class="stat-count">${quantity}</span></span>`;
            boughtItemsContainer.insertAdjacentHTML('beforeend', badgeHTML);
        } else {
            const badgeHTML = `<span class="stat-badge">${name} <span class="stat-count">${quantity}</span></span>`;
            leftItemsContainer.insertAdjacentHTML('beforeend', badgeHTML);
        }
    });
}

function addItem() {
    const newProductName = inputField.value.trim();

    if (newProductName === "") {
        inputField.focus();
        return;
    }

    const htmlString = `
        <li class="item">
            <span class="item-name">${newProductName}</span>
            <div class="item-controls">
                <button class="btn-minus" disabled data-tooltip="Зменшити кількість" aria-label="Зменшити">−</button>
                <span class="item-quantity">1</span>
                <button class="btn-plus" data-tooltip="Збільшити кількість" aria-label="Збільшити">+</button>
            </div>
            <div class="item-status">
                <button class="btn-state" data-tooltip="Позначити як куплене">Куплено</button>
                <button class="btn-delete" data-tooltip="Видалити товар" aria-label="Видалити">×</button>
            </div>
        </li>
    `;

    itemsList.insertAdjacentHTML('beforeend', htmlString);
    
    inputField.value = "";
    addButton.classList.remove('btn-add-active')

    inputField.focus();

    saveCartToStorage()

    updateStatistics();
}

inputField.addEventListener('input', function() {
    let value = inputField.value.trim()

    if (value != "" || length > 0) addButton.classList.add('btn-add-active');

    else addButton.classList.remove('btn-add-active')
});

addButton.addEventListener('click', addItem);

inputField.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        addItem();
    }
});

itemsList.addEventListener('click', function(event) {
    const target = event.target;
    
    const itemRow = target.closest('.item');
    if (!itemRow) return;

    const quantitySpan = itemRow.querySelector('.item-quantity');
    const nameSpan = itemRow.querySelector('.item-name');
    const stateButton = itemRow.querySelector('.btn-state');
    const minusBtn = itemRow.querySelector('.btn-minus');
    const plusBtn = itemRow.querySelector('.btn-plus');
    const deleteBtn = itemRow.querySelector('.btn-delete')

    if (target.classList.contains('item-name') && !target.classList.contains('strike-through')) {
        const editInput = document.createElement('input');
        editInput.type = 'text';
        editInput.className = 'item-edit-input'
        editInput.value = nameSpan.textContent;
        nameSpan.replaceWith(editInput);
        editInput.focus();

        editInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                const finalName = editInput.value.trim() || nameSpan.textContent
                nameSpan.textContent = finalName
                editInput.replaceWith(nameSpan);

                saveCartToStorage();

                updateStatistics();
            }
        })

        editInput.addEventListener('blur', function() {
            const finalName = editInput.value.trim() || nameSpan.textContent
            nameSpan.textContent = finalName
            editInput.replaceWith(nameSpan);

            saveCartToStorage();

            updateStatistics();
        })
    }

    else if (target.classList.contains('btn-plus')) {
        let currentQuantity = parseInt(quantitySpan.textContent);
        currentQuantity++;
        quantitySpan.textContent = currentQuantity;
        
        if (currentQuantity > 1 && minusBtn) {
            minusBtn.disabled = false;
        }
        saveCartToStorage();

        updateStatistics();
    } 
    
    else if (target.classList.contains('btn-minus')) {
        let currentQuantity = parseInt(quantitySpan.textContent);
        if (currentQuantity > 1) {
            currentQuantity--;
            quantitySpan.textContent = currentQuantity;
            
            if (currentQuantity === 1 && minusBtn) {
                minusBtn.disabled = true;
                minusBtn.style.cursor = 'not-allowed';
            }
            saveCartToStorage();

            updateStatistics();
        }
    } 
    
    else if (target.classList.contains('btn-delete')) {
        itemRow.remove();

        saveCartToStorage();

        updateStatistics();
    } 
    
    else if (target.classList.contains('btn-state')) {
        if (nameSpan) {
            nameSpan.classList.toggle('strike-through');
            const isBought = nameSpan.classList.contains('strike-through');
            
            if (isBought) {
                stateButton.textContent = "Не куплено";
                stateButton.setAttribute('data-tooltip', 'Повернути до списку покупок');
                
                [minusBtn, plusBtn, deleteBtn].forEach(btn => btn && (btn.style.visibility = 'hidden'));
            } else {
                stateButton.textContent = "Куплено";
                stateButton.setAttribute('data-tooltip', 'Позначити як куплене');
                
                [minusBtn, plusBtn, deleteBtn].forEach(btn => btn && (btn.style.visibility = 'visible'));
            }
            saveCartToStorage();

            updateStatistics();
        }
    }
});

itemsList.querySelectorAll('.item').forEach(item => {
    const nameSpan = item.querySelector('.item-name')
    const minusBtn = item.querySelector('.btn-minus')
    const plusBtn = item.querySelector('.btn-plus')
    const deleteBtn = item.querySelector('.btn-delete')

    if (nameSpan && nameSpan.classList.contains('strike-through')) {
        [minusBtn, plusBtn, deleteBtn].forEach(btn => btn && (btn.style.visibility = 'hidden'));
    }
 })

function saveCartToStorage() {
    let cartData = [];
    itemsList.querySelectorAll('.item').forEach(item => {
        const getItem = item.querySelector('.item-name')
        const getQuant = item.querySelector('.item-quantity')

        const itemName = getItem.textContent
        const itemQuantity = getQuant.textContent;
        const isBought = getItem.classList.contains('strike-through');

        const itemObject = {
            name: itemName, 
            amount: itemQuantity, 
            status: isBought
        };
        cartData.push(itemObject);
    })
    localStorage.setItem('myCart', JSON.stringify(cartData))
}

function loadCartFromStorage() {
    const savedData = localStorage.getItem('myCart');
    if (savedData) {
        itemsList.innerHTML = ''

        const parsedCart = JSON.parse(savedData);
        
        parsedCart.forEach(itemData => {
            let nameClass = 'item-name';
            let buttonStyle = '';
            let stateText = 'Куплено';
            let stateTooltip = 'Позначити як куплене';
            let minusDisabled = '';

            if (itemData.status) {
                nameClass = 'item-name strike-through';
                buttonStyle = 'style="visibility: hidden; "';
                stateText = 'Не куплено';
                stateTooltip = 'Повернути до списку покупок';
            }

            if (parseInt(itemData.amount) <= 1) minusDisabled = 'disabled';

            const htmlString = `
                <li class="item"> 
                    <span class="${nameClass}">${itemData.name}</span>
                    <div class="item-controls">
                        <button ${buttonStyle} class="btn-minus" ${minusDisabled} data-tooltip="Зменшити кількість" aria-label="Зменшити">−</button>
                        <span class="item-quantity">${itemData.amount}</span>
                        <button ${buttonStyle} class="btn-plus" data-tooltip="Збільшити кількість" aria-label="Збільшити">+</button>
                    </div>
                    <div class="item-status">
                        <button class="btn-state" data-tooltip="${stateTooltip}">${stateText}</button>
                        <button ${buttonStyle} class="btn-delete" data-tooltip="Видалити товар" aria-label="Видалити">×</button>
                    </div>
                </li>    
            `;

            itemsList.insertAdjacentHTML('beforeend', htmlString);
        });
    }
}

loadCartFromStorage()

updateStatistics();