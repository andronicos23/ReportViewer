
document.addEventListener('DOMContentLoaded', () => {
    // Set dynamic year in footer - https://updateyourfooter.com/
    const currentYear = new Date().getFullYear();
    document.getElementById('footer-text').textContent = `© ${currentYear} Andronikos. All Rights Reserved.`;

    // Load initial reports from reports.json
    loadReports();
});

// Load reports from reports.json
async function loadReports() {
    try {
        const response = await fetch('reports.json');
        if (!response.ok) {
            throw new Error('Failed to load reports.json');
        }

        const reportsData = await response.json();
        const tableBody = document.querySelector("#reportsTable tbody");

        reportsData.content.forEach(report => {
            const row = document.createElement("tr");
            
            const nameCell = document.createElement('td');
            nameCell.textContent = report.name;

            const descriptionCell = document.createElement('td');
            descriptionCell.textContent = report.description;

            const modifiedDateCell = document.createElement('td');
            modifiedDateCell.textContent = new Date(report.modifiedDate).toLocaleDateString('en-GB');

            const linkCell = document.createElement('td');
            const reportLink = document.createElement('a');
            
            reportLink.classList.add('collection-item','btn','btn-outline-primary','btn-sm');
         
    
            reportLink.href = '#';
            reportLink.textContent = 'View';

            reportLink.onclick = async (event) => {
                event.preventDefault();

                try {
                    const result = await getFilteredSubReportDate();
                    //console.log(result); 
                    fetchReportData(report.id, result);
                   
                } catch (error) {
                    document.getElementById('data-container').innerHTML = '<p class="red-text">Please select date.</p>';
                    //console.log(error); 
                }
            };

            linkCell.appendChild(reportLink);
            row.appendChild(nameCell);
            row.appendChild(descriptionCell);
            row.appendChild(modifiedDateCell);
            row.appendChild(linkCell);
            tableBody.appendChild(row);
        });
    } catch (error) {
        document.getElementById('report-list').innerHTML = '<p class="red-text">Error loading report list.</p>';
        console.error('Error fetching reports:', error);
    }
}

function getFilteredSubReportDate() {
            return new Promise((resolve, reject) => {
                // Get the modal
                let modal = document.getElementById("myModal");

                // Get the button that opens the modal
                
                let btn = document.getElementById("myBtn");
                let myBtnCancel = document.getElementById("myBtnCancel");

                // Get the <span> element that closes the modal
                let span = document.getElementsByClassName("close")[0];

                // When the user clicks the button, open the modal
                btn.onclick = function() { // check i need to change this to addEventListener 
                    // Close the modal
                    modal.style.display = "none";
                    // Resolve the promise and return the desired string
                    let dateStr = document.getElementById("dateForApi").value.replace('-', '');;

                    let [month, year] = dateStr.split('/');
                    let formattedDate = `${year}${month}`;

                    

                    
                    resolve(formattedDate);
                }

                // When the user clicks on <span> (x), close the modal
                myBtnCancel.onclick = function() {
                    // Close the modal
                    modal.style.display = "none";
                    // Reject the promise if canceled
                    reject("User canceled the action.");
                }

                // When the user clicks anywhere outside of the modal, close it
                window.onclick = function(event) {
                    if (event.target == modal) {
                        // Close the modal
                        modal.style.display = "none";
                        // Reject the promise if canceled
                        reject("User clicked outside and canceled the action.");
                    }
                }

                // Show the modal when the function is called
                modal.style.display = "block";
            });
}





async function fetchReportData(reportId, reportDate) {
    const fileName = `/ReportViewer/reports/${reportId}-${reportDate}.json`;  // Dynamically build the filename
    const dataContainer = document.getElementById('data-container');
    
    dataContainer.innerHTML = '<p>Loading data...</p>'; // lazy loading

    try {
        const response = await fetch(fileName);
        
        if (response.status === 404) {
            dataContainer.innerHTML = '<p class="red-text">Json Report not found. Please change date</p>';
            const sumOfTotalAmounts = document.getElementById('sumTotal');
            sumOfTotalAmounts.innerHTML = "";

            return;
        }
        // eror if not ok
        if (!response.ok) {
            dataContainer.innerHTML = '<p class="red-text">Failed to load report data.</p>';
            throw new Error('Failed to load report data');
        }

        // wait  JSON data 
        const jsonData = await response.json();

        

        // Process the data and update
        dataContainer.innerHTML = createSubReportTable(jsonData);
        setupPagination();
    } catch (error) {
        // Handle errors if the fetch fails or other error
        dataContainer.innerHTML = '<p class="red-text">Error loading data.</p>';
        console.error('Error fetching report data:', error); // Log error for debugging
    }
}


function createSubReportTable(data) {
    const columns = data.columns;  // Array of column names
    const rows = data.data;       // Array of rows
    let totalAmounts = 0;

    let table = '<table class="table table-striped" id="subReportTable"><thead><tr>';

    // Create the table header dynamically based on column names
    columns.forEach((column, index) => {
        table += `<th data-index="${index}" onclick="sortReportTable(event)">${column}<span class="sort-arrow"></span></th>`;
    });

    table += '</tr></thead><tbody>';

    // Iterate over the rows and create table rows
    rows.forEach(row => {
        table += '<tr>';
        row.forEach(cell => {
            table += `<td>${cell}</td>`;
            if (!isNaN(cell) && cell !== '') {
                totalAmounts += parseFloat(cell);  // Add the numeric value to the total
            }
        });
        table += '</tr>';
    });

    table += '</tbody></table>';
    

    const sumOfTotalAmounts = document.getElementById('sumTotal');
    if (sumOfTotalAmounts != null)
    {
        sumOfTotalAmounts.innerHTML = `Total Sum of ${columns[columns.length - 1]}: ${totalAmounts}`; 
    }

    return table;
}

let sortOrder = {}; // Object to keep track of sorting order for each column

function sortReportTable(event) {
    const header = event.target;
    const columnIndex = header.getAttribute('data-index');
    const th = event.target.closest('th');
    // Get the table body and rows
    const table = header.closest('table');
    const tbody = table.querySelector('tbody');
    const rows = Array.from(tbody.rows);
    let isAscending;



    // Determine the sorting order (toggle between ascending and descending)
    const order = sortOrder[columnIndex] === 'asc' ? 'desc' : 'asc';
    sortOrder[columnIndex] = order;

    isAscending =  order === 'asc' ? true : false;

    document.querySelectorAll('.sort-arrow').forEach(arrow => arrow.textContent = '');

    // Add arrow indicator
    const arrow = th.querySelector('.sort-arrow');
    if (arrow !== null) {
        arrow.textContent = isAscending ? ' ↑' : ' ↓';
    }

    if (columnIndex !== null) //check if its modified date dont enter
    {
    // Sort the rows based on the column data
        rows.sort((rowA, rowB) => {
            const cellA = rowA.cells[columnIndex].textContent;
            const cellB = rowB.cells[columnIndex].textContent;

            // Compare as numeric if the column data is a number, otherwise compare as strings
            if (!isNaN(cellA) && !isNaN(cellB)) {
                return order === 'asc' ? parseFloat(cellA) - parseFloat(cellB) : parseFloat(cellB) - parseFloat(cellA);
            } else {
                return order === 'asc' ? cellA.localeCompare(cellB) : cellB.localeCompare(cellA);
            }
        });
    }

    // Re-append sorted rows to the table body
    rows.forEach(row => {
        tbody.appendChild(row);
    });
}


