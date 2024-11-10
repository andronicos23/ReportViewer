function setupPagination() {
    const table = document.getElementById('subReportTable');
    if (!table) {
        console.error('Table not found.');
        return;
    }

    let rowsPerPage = 15; // Default value
    const tableBody = table.querySelector('tbody');
    const rows = Array.from(tableBody.querySelectorAll('tr'));
    const totalRows = rows.length;
    let totalPages = Math.ceil(totalRows / rowsPerPage);

    // Create rows per page dropdown
    const rowsPerPageDropdown = document.createElement('select');
    rowsPerPageDropdown.id = 'rows-per-page-dropdown';
    rowsPerPageDropdown.classList.add('form-select', 'form-select'); // Smaller select for uniformity
    rowsPerPageDropdown.innerHTML = `
        <option value="15">15</option>
        <option value="20">20</option>
        <option value="30">30</option>
        <option value="${totalRows}">All</option>
    `;
    rowsPerPageDropdown.value = rowsPerPage;
    rowsPerPageDropdown.addEventListener('change', (e) => {
        rowsPerPage = parseInt(e.target.value, 10);
        totalPages = Math.ceil(totalRows / rowsPerPage);
        displayPage(1); // Reset to the first page after change
    });

    const paginationContainer = document.getElementById('pagination-controls') || document.createElement('nav');
    paginationContainer.id = 'pagination-controls';
    paginationContainer.innerHTML = ''; // Clear previous pagination
    paginationContainer.setAttribute('aria-label', 'Page navigation');

    // Create a container for pagination buttons and the dropdown
    const controlsContainer = document.createElement('div');
    controlsContainer.classList.add('d-flex', 'justify-content-between'); // Flex container

    // Create pagination buttons
    const ul = document.createElement('ul');
    ul.classList.add('pagination');
    controlsContainer.appendChild(ul);

    // Add the dropdown to the controls container
    const dropdownContainer = document.createElement('div');
    dropdownContainer.classList.add('ms-3'); // Space to the left of dropdown
    dropdownContainer.appendChild(rowsPerPageDropdown);
    controlsContainer.appendChild(dropdownContainer);

    paginationContainer.appendChild(controlsContainer);
    table.parentNode.appendChild(paginationContainer);

    function displayPage(pageNumber) {
        tableBody.innerHTML = ''; // Clear existing rows
        const startIndex = (pageNumber - 1) * rowsPerPage;
        const endIndex = (rowsPerPage === totalRows) ? totalRows : Math.min(startIndex + rowsPerPage, totalRows);

        for (let i = startIndex; i < endIndex; i++) {
            tableBody.appendChild(rows[i]);
        }

        updatePaginationControls(pageNumber);
    }

    function updatePaginationControls(currentPage) {
        const ul = paginationContainer.querySelector('.pagination');
        ul.innerHTML = ''; // Clear existing pagination controls

        // Previous button
        const prevLi = document.createElement('li');
        prevLi.classList.add('page-item');
        if (currentPage === 1) {
            prevLi.classList.add('disabled');
        }
        const prevButton = document.createElement('a');
        prevButton.classList.add('page-link');
        prevButton.href = '#';
        prevButton.textContent = 'Previous';
        prevButton.onclick = (e) => {
            e.preventDefault();
            if (currentPage > 1) {
                displayPage(currentPage - 1);
            }
        };
        prevLi.appendChild(prevButton);
        ul.appendChild(prevLi);

        // Page buttons
        for (let i = 1; i <= totalPages; i++) {
            const li = document.createElement('li');
            li.classList.add('page-item');
            if (i === currentPage) {
                li.classList.add('active');
            }
            const pageButton = document.createElement('a');
            pageButton.classList.add('page-link');
            pageButton.href = '#';
            pageButton.textContent = i;
            pageButton.onclick = (e) => {
                e.preventDefault();
                displayPage(i);
            };
            li.appendChild(pageButton);
            ul.appendChild(li);
        }

        // Next button
        const nextLi = document.createElement('li');
        nextLi.classList.add('page-item');
        if (currentPage === totalPages) {
            nextLi.classList.add('disabled');
        }
        const nextButton = document.createElement('a');
        nextButton.classList.add('page-link');
        nextButton.href = '#';
        nextButton.textContent = 'Next';
        nextButton.onclick = (e) => {
            e.preventDefault();
            if (currentPage < totalPages) {
                displayPage(currentPage + 1);
            }
        };
        nextLi.appendChild(nextButton);
        ul.appendChild(nextLi);
    }

    displayPage(1); // Initial page load
}
