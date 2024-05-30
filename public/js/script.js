document.addEventListener('DOMContentLoaded', function() {
    setupButtonListeners();
    initialize();
    setupFileUploadListener();
});

function initialize() {
    console.log("Initialization complete.");
}

function setupFileUploadListener() {
    const uploadInput = document.getElementById('file-upload');
    uploadInput.accept = ".json";  // Asegurarse de que solo se aceptan archivos JSON

    uploadInput.onchange = event => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const fileContent = e.target.result;
                sessionStorage.setItem('categoryData', fileContent);
                console.log('Archivo JSON subido y almacenado correctamente.');

                // Parsear el contenido del archivo JSON
                const jsonContent = JSON.parse(fileContent);

                // Imprimir categorías y subcategorías por si se desea consultar
                const categories = jsonContent.Categories;
                console.log('Categorías y Subcategorías:');
                for (const categoryName in categories) {
                    console.log(categoryName);  // Imprime el nombre de la categoría
                    const subcategories = categories[categoryName];
                    for (const subcategoryName in subcategories) {
                        console.log(`  - ${subcategoryName}`);  // Imprime el nombre de la subcategoría con indentación
                    }
                }
            };
            reader.readAsText(file);
        }
    };
}

function uploadTemplateCategories(event) {
    event.preventDefault();
    const uploadInput = document.createElement("input");
    uploadInput.type = "file";
    uploadInput.accept = ".json";
    uploadInput.onchange = event => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const fileContent = e.target.result;
                sessionStorage.setItem('categoryData', fileContent);
                console.log('Archivo JSON subido y almacenado correctamente.');
                
                // Parsear el contenido del archivo JSON
                const jsonContent = JSON.parse(fileContent);
                
                // Imprimir categorías y subcategorías por si se desea consultar
                const categories = jsonContent.Categories;
                console.log('Categorías y Subcategorías:');
                for (const categoryName in categories) {
                    console.log(categoryName);  // Imprime el nombre de la categoría
                    const subcategories = categories[categoryName];
                    for (const subcategoryName in subcategories) {
                        console.log(`  - ${subcategoryName}`);  // Imprime el nombre de la subcategoría con indentación
                    }
                }
            };
            reader.readAsText(file);
        }
    };
    uploadInput.click();
}

function displayError(errorMessage) {
    const responseElement = document.getElementById('categoryList');

    const li = document.createElement('li');
    li.className = 'error-message';
    li.textContent = `Error: ${errorMessage}`;
    responseElement.appendChild(li);
}

function setupButtonListeners() {
    const startButton = document.getElementById('startExploration');
    if (startButton) {
        startButton.addEventListener('click', function() {
            console.log("Click registrado");
            initiateCategoryProcess();
        });
    }

    const clearButton = document.getElementById('clearCategories');
    if (clearButton) {
        clearButton.addEventListener('click', function() {
            clearCategories();
        });
    }
}

function clearCategories() {
    const categoryListElement = document.getElementById('categoryList');
    if (categoryListElement) {
        categoryListElement.innerHTML = ''; // Clear the displayed list
    }
}

// ==============================================================================
// CATEGORÍAS
// ==============================================================================

function initiateCategoryProcess() {
    const description = document.getElementById('userNeeds').value.trim();
    sessionStorage.setItem('currentDescription', description); // Guardar en sessionStorage
    if (!description) {
        console.log("Por favor, describe tu artículo.");
        return;
    }

    const jsonData = sessionStorage.getItem('categoryData');
    if (!jsonData) {
        console.log('No se encontraron datos de categorías. Por favor, sube un archivo JSON primero.');
        return;
    }

    const data = JSON.parse(jsonData);
    if (data && data.Categories) {
        const categories = Object.keys(data.Categories);
        const promptMessage = createCategoryPrompt(description, categories);
        sendCategoryMessageToServer(promptMessage);
    } else {
        console.log('No se encontraron categorías en el JSON subido.');
    }
}

function createCategoryPrompt(description, categories) {
    let promptMessage = `Based on the description provided, please choose the most appropriate category from the list below. Respond with only the name of the selected category exactly as it appears, even if it contains typos or errors. If the description matches multiple categories equally, choose the one that best represents the primary context of the description. If no category is appropriate, begin your response with "ERROR:" followed by your reason.\n`;
    promptMessage += `Description: "${description}".\n`;
    promptMessage += `Categories: ${categories.join(', ')}.\n`;
    promptMessage += `Please ensure your response contains only the category name or an error message as specified.\n`;

    return promptMessage;
}

function sendCategoryMessageToServer(message) {
    fetch('/api/chat', {
        method: 'POST',
        headers: {'Content-Type': 'text/plain'},
        body: message
    })
    .then(response => response.json())
    .then(data => {
        const category = getSelectedCategory(data);
        if (category) {
            processCategory(category, message);
        } else {
            displayError('No valid category found.');
        }
    })
    .catch(error => {
        console.error('Error al procesar tu solicitud: ' + error);
    });
}

function getSelectedCategory(data) {
    if (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
        const responseContent = data.choices[0].message.content;
        if (responseContent.startsWith("ERROR:")) {
            displayError(responseContent);
            return null;
        } else {
            return responseContent;
        }
    }
    return null;
}

function processCategory(category, originalMessage) {
    const jsonData = sessionStorage.getItem('categoryData');
    if (!jsonData) {
        console.error('Datos de categoría no encontrados.');
        return;
    }

    const data = JSON.parse(jsonData);
    const subcategories = data.Categories[category];
    if (subcategories) {
        displayChatGPTResponseCategory(category, originalMessage);
        initiateSubcategoryProcess(category);
    } else {
        displayError('No se encontraron subcategorías para la categoría seleccionada.');
    }
}

function displayChatGPTResponseCategory(category, originalMessage) {
    const responseElement = document.getElementById('categoryList');
    if (!responseElement) {
        console.error('Elemento con ID "categoryList" no encontrado.');
        return;
    }

    const originalCategories = originalMessage.split('\n')[2].replace('Categories: ', '');

    const categoriesSent = document.createElement('p');
    categoriesSent.className = 'category-title';
    categoriesSent.textContent = 'Categories sent to ChatGPT:';
    responseElement.appendChild(categoriesSent);

    const categoriesList = document.createElement('p');
    categoriesList.textContent = originalCategories;
    responseElement.appendChild(categoriesList);

    const selectedCategoryTitle = document.createElement('p');
    selectedCategoryTitle.className = 'category-title chatgpt-response';
    selectedCategoryTitle.textContent = 'Selected category by ChatGPT:';
    responseElement.appendChild(selectedCategoryTitle);

    const selectedCategoryName = document.createElement('p');
    selectedCategoryName.className = 'category-content chatgpt-response';
    selectedCategoryName.textContent = category;
    responseElement.appendChild(selectedCategoryName);
}

// ==============================================================================
// SUBCATEGORÍAS
// ==============================================================================

function initiateSubcategoryProcess(category) {
    const jsonData = sessionStorage.getItem('categoryData');
    if (!jsonData) {
        console.error('Datos de categoría no encontrados.');
        return;
    }

    const data = JSON.parse(jsonData);
    const subcategories = data.Categories[category];
    if (subcategories) {
        const subcategoryList = Object.keys(subcategories);
        const description = sessionStorage.getItem('currentDescription');
        const subcategoryMessage = createSubcategoryPrompt(category, subcategoryList, description);
        sendSubcategoryMessageToServer(subcategoryMessage, category);
    } else {
        console.error('No se encontraron subcategorías para la categoría seleccionada.');
    }
}

function createSubcategoryPrompt(selectedCategory, subcategories, description) {
    let firstSubcategory = subcategories[0];
    let promptMessage = `You are assisting in navigating a web application that categorizes items. Based on the selected category "${selectedCategory}" and the initial description provided ("${description}"), please choose the most appropriate subcategory from the list below. If the description applies equally across multiple subcategories or if there is insufficient context to distinguish them, default to selecting '${firstSubcategory}'.\n`;
    promptMessage += `Subcategories: ${subcategories.join(', ')}.\n`;
    promptMessage += `Respond only with the subcategory name.\n`;

    return promptMessage;
}

function sendSubcategoryMessageToServer(message, category) {
    fetch('/api/chat', {
        method: 'POST',
        headers: {'Content-Type': 'text/plain'},
        body: message
    })
    .then(response => response.json())
    .then(data => {
        const subcategory = getSelectedCategory(data);
        if (subcategory) {
            processSubcategory(category, subcategory, message);
        } else {
            displayError('Subcategoría válida no encontrada.');
        }
    })
    .catch(error => {
        console.error('Error al procesar tu solicitud: ' + error);
    });
}

function processSubcategory(category, subcategory, originalMessage) {
    displayChatGPTResponseSubcategory(subcategory, originalMessage);
    initiateItemDescriptionProcess(category, subcategory);
}

function displayChatGPTResponseSubcategory(subcategory, originalMessage) {
    const responseElement = document.getElementById('categoryList');
    if (!responseElement) {
        console.error('Elemento con ID "categoryList" no encontrado.');
        return;
    }

    const originalSubcategories = originalMessage.split('\n')[1].replace('Subcategories: ', '');

    const subcategoriesSent = document.createElement('p');
    subcategoriesSent.className = 'category-title';
    subcategoriesSent.textContent = 'Subcategories sent to ChatGPT:';
    responseElement.appendChild(subcategoriesSent);

    const subcategoriesList = document.createElement('p');
    subcategoriesList.textContent = originalSubcategories;
    responseElement.appendChild(subcategoriesList);

    const selectedSubcategoryPrompt = document.createElement('p');
    selectedSubcategoryPrompt.className = 'category-title chatgpt-response';
    selectedSubcategoryPrompt.textContent = 'Selected subcategory by ChatGPT:';
    responseElement.appendChild(selectedSubcategoryPrompt);

    const selectedSubcategoryName = document.createElement('p');
    selectedSubcategoryName.className = 'category-content chatgpt-response';
    selectedSubcategoryName.textContent = subcategory;
    responseElement.appendChild(selectedSubcategoryName);
}

// ==============================================================================
// DESCRIPCIONES DE ÍTEMS
// ==============================================================================

function initiateItemDescriptionProcess(category, subcategory) {
    const jsonData = sessionStorage.getItem('categoryData');
    if (!jsonData) {
        console.error('Datos de categoría no encontrados.');
        return;
    }

    const data = JSON.parse(jsonData);
    const items = data.Categories[category]?.[subcategory]?.Items;

    if (items) {
        const descriptions = items.map(item => item.description);
        console.log("Descripciones de ítems:", descriptions);
        const userDescription = sessionStorage.getItem('currentDescription');
        const itemDescriptionMessage = createItemDescriptionPrompt(subcategory, descriptions, userDescription);
        sendItemDescriptionMessageToServer(itemDescriptionMessage, subcategory);
    } else {
        console.error('No se encontraron ítems para la subcategoría seleccionada:', subcategory);
    }
}

function createItemDescriptionPrompt(subcategory, itemDescriptions, userDescription) {
    let promptMessage = `Based on the selected subcategory "${subcategory}" and user's description "${userDescription}", please choose the most relevant item from the descriptions below.\n`;
    promptMessage += `Item Descriptions: ${itemDescriptions.join(', ')}.\n`;
    promptMessage += `Respond only with the description or a brief identifier.\n`;
    return promptMessage;
}

function sendItemDescriptionMessageToServer(message, subcategory) {
    fetch('/api/chat', {
        method: 'POST',
        headers: {'Content-Type': 'text/plain'},
        body: message
    })
    .then(response => response.json())
    .then(data => {
        const selectedItemDescription = getSelectedItemDescription(data);
        if (selectedItemDescription) {
            displayItemDescriptionResponse(selectedItemDescription, message);
            displayClassificationResults(selectedItemDescription);
        } else {
            displayError('Descripción de ítem válida no encontrada.');
        }
    })
    .catch(error => {
        console.error('Error al procesar tu solicitud: ' + error);
    });
}

function getSelectedItemDescription(data) {
    if (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
        const responseContent = data.choices[0].message.content;
        if (responseContent.startsWith("ERROR:")) {
            displayError(responseContent);
            return null;
        } else {
            return responseContent;
        }
    }
    return null;
}

function displayItemDescriptionResponse(selectedItemDescription, originalMessage) {
    const responseElement = document.getElementById('categoryList');
    if (!responseElement) {
        console.error('Elemento con ID "categoryList" no encontrado.');
        return;
    }

    const originalItemDescriptions = originalMessage.split('\n')[1].replace('Item Descriptions: ', '').split(".,");
    const itemDescriptionsSent = document.createElement('p');
    itemDescriptionsSent.className = 'category-title';
    itemDescriptionsSent.textContent = 'Item descriptions sent to ChatGPT:';
    responseElement.appendChild(itemDescriptionsSent);

    const itemDescriptionsContainer = document.createElement('div');
    itemDescriptionsContainer.className = 'item-descriptions-container';

    originalItemDescriptions.forEach(description => {
        if (description.trim() !== "") {
            const itemDescription = document.createElement('p');
            itemDescription.className = 'item-description';
            itemDescription.textContent = `"${description.trim()}."`;
            itemDescriptionsContainer.appendChild(itemDescription);
        }
    });
    responseElement.appendChild(itemDescriptionsContainer);

    const selectedItemDescriptionPrompt = document.createElement('p');
    selectedItemDescriptionPrompt.className = 'category-title chatgpt-response';
    selectedItemDescriptionPrompt.textContent = 'Selected item description by ChatGPT:';
    responseElement.appendChild(selectedItemDescriptionPrompt);

    const selectedItemDescriptionText = document.createElement('p');
    selectedItemDescriptionText.className = 'category-content chatgpt-response';
    selectedItemDescriptionText.textContent = `"${selectedItemDescription}"`;
    responseElement.appendChild(selectedItemDescriptionText);
}

function displayClassificationResults(selectedItemDescription) {
    const jsonData = JSON.parse(sessionStorage.getItem('categoryData'));
    let selectedItemDetails = null;

    for (let category in jsonData.Categories) {
        for (let subcategory in jsonData.Categories[category]) {
            const items = jsonData.Categories[category][subcategory].Items;
            selectedItemDetails = items.find(item => item.description === selectedItemDescription);
            if (selectedItemDetails) break;
        }
        if (selectedItemDetails) break;
    }

    if (!selectedItemDetails) {
        console.error('Ítem no encontrado.');
        return;
    }

    const resultText = document.getElementById('resultText');
    if (!resultText) {
        console.error('Elemento con ID "resultText" no encontrado.');
        return;
    }

    resultText.innerHTML = '';

    const introParagraph = document.createElement('p');
    introParagraph.textContent = 'Based on your initial description of the new item, ChatGPT has identified the most similar item in your uploaded collection:';
    introParagraph.style.fontSize = '16px';
    introParagraph.style.fontWeight = 'bold';
    resultText.appendChild(introParagraph);

    const detailsDiv = document.createElement('div');
    detailsDiv.style.color = '#333';
    detailsDiv.style.border = '1px solid #ccc';
    detailsDiv.style.padding = '10px';
    detailsDiv.style.marginTop = '10px';
    detailsDiv.style.borderRadius = '5px';
    detailsDiv.style.backgroundColor = '#f9f9f9';
    detailsDiv.innerHTML = `
        <strong>ID:</strong> ${selectedItemDetails.id}<br>
        <strong>Name:</strong> ${selectedItemDetails.name}<br>
        <strong>Description:</strong> ${selectedItemDetails.description}<br>
        <strong>Additional Info:</strong> ${selectedItemDetails.additional_info}<br>
        <strong>Tags:</strong> ${selectedItemDetails.tags.join(', ')}
    `;
    resultText.appendChild(detailsDiv);
}
