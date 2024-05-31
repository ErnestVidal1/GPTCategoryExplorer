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

// Configura los oyentes de eventos para los botones
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


// Inicia el proceso de categorías
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

    } else {
        console.log('No se encontraron categorías en el JSON subido.');
    }
}

// Función para crear el mensaje del primer prompt para categorías
function createCategoryPrompt(description, categories) {
    let promptMessage = `Based on the description provided, please choose the most appropriate category from the list below. Respond with only the name of the selected category exactly as it appears, even if it contains typos or errors. If the description matches multiple categories equally, choose the one that best represents the primary context of the description. If no category is appropriate, begin your response with "ERROR:" followed by your reason.\n`;
    promptMessage += `Description: "${description}".\n`;
    promptMessage += `Categories: ${categories.join(', ')}.\n`;
    promptMessage += `Please ensure your response contains only the category name or an error message as specified.\n`;
alert(promptMessage);
    return promptMessage;
}