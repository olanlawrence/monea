import {
    auth,
    db
} from "../firebase-config.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

import {
    collection,
    addDoc,
    getDocs,
    getDoc,
    doc,
    query,
    orderBy,
    serverTimestamp,
    updateDoc,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";


let currentUser = null;

let expenses = [];

let editingExpenseId = null;


/* =========================================
   DOM READY
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        initializeNavigation();

        initializeExpenseControls();

        initializeSettings();

        initializeAuthentication();

    }
);


/* =========================================
   AUTHENTICATION
========================================= */

function initializeAuthentication() {

    onAuthStateChanged(
        auth,
        async function (user) {

            if (!user) {

                window.location.href =
                    "login.html";

                return;

            }


            currentUser = user;


            console.log(
                "Logged in:",
                user.email
            );


            await loadUserProfile();

            await loadExpenses();


            refreshEverything();

        }
    );

}


/* =========================================
   EXPENSE CONTROLS
========================================= */

function initializeExpenseControls() {

    const expenseForm =
        document.getElementById(
            "expenseForm"
        );


    const addExpenseBtn =
        document.getElementById(
            "addExpenseBtn"
        );


    const expensesAddBtn =
        document.getElementById(
            "expensesAddBtn"
        );


    const chartAddExpenseBtn =
        document.getElementById(
            "chartAddExpenseBtn"
        );


    const closeModal =
        document.getElementById(
            "closeModal"
        );


    const cancelModal =
        document.getElementById(
            "cancelModal"
        );


    const expenseModal =
        document.getElementById(
            "expenseModal"
        );


    const chartFilter =
        document.getElementById(
            "chartFilter"
        );


    /* ADD BUTTONS */

    if (addExpenseBtn) {

        addExpenseBtn.addEventListener(
            "click",
            function () {

                openAddExpenseModal();

            }
        );

    }


    if (expensesAddBtn) {

        expensesAddBtn.addEventListener(
            "click",
            function () {

                openAddExpenseModal();

            }
        );

    }


    if (chartAddExpenseBtn) {

        chartAddExpenseBtn.addEventListener(
            "click",
            function () {

                openAddExpenseModal();

            }
        );

    }


    /* CLOSE */

    if (closeModal) {

        closeModal.addEventListener(
            "click",
            closeExpenseModal
        );

    }


    if (cancelModal) {

        cancelModal.addEventListener(
            "click",
            closeExpenseModal
        );

    }


    if (expenseModal) {

        expenseModal.addEventListener(
            "click",
            function (event) {

                if (
                    event.target ===
                    expenseModal
                ) {

                    closeExpenseModal();

                }

            }
        );

    }


    /* CHART */

    if (chartFilter) {

        chartFilter.addEventListener(
            "change",
            renderSpendingChart
        );

    }


    /* FORM */

    if (expenseForm) {

        expenseForm.addEventListener(
            "submit",
            saveExpense
        );

    }

}


/* =========================================
   NAVIGATION
========================================= */

function initializeNavigation() {

    const navItems =
        document.querySelectorAll(
            ".nav-item[data-section]"
        );


    const sections =
        document.querySelectorAll(
            ".page-section"
        );


    navItems.forEach(
        function (item) {

            item.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();


                    const sectionId =
                        item.getAttribute(
                            "data-section"
                        );


                    sections.forEach(
                        function (section) {

                            section.classList.remove(
                                "active-section"
                            );

                        }
                    );


                    const selectedSection =
                        document.getElementById(
                            sectionId
                        );


                    if (selectedSection) {

                        selectedSection.classList.add(
                            "active-section"
                        );

                    }


                    navItems.forEach(
                        function (navItem) {

                            navItem.classList.remove(
                                "active"
                            );

                        }
                    );


                    item.classList.add(
                        "active"
                    );


                    if (
                        sectionId ===
                        "expensesSection"
                    ) {

                        renderAllExpenses();

                    }


                    if (
                        sectionId ===
                        "categoriesSection"
                    ) {

                        renderFullCategories();

                    }

                }
            );

        }
    );


    /* View All button */

    const viewAllButton =
        document.querySelector(
            "[data-section-button='expensesSection']"
        );


    if (viewAllButton) {

        viewAllButton.addEventListener(
            "click",
            function () {

                const expensesNav =
                    document.querySelector(
                        "[data-section='expensesSection']"
                    );


                if (expensesNav) {

                    expensesNav.click();

                }

            }
        );

    }

}


/* =========================================
   LOAD PROFILE
========================================= */

async function loadUserProfile() {

    if (!currentUser) return;


    try {

        const userRef =
            doc(
                db,
                "users",
                currentUser.uid
            );


        const snapshot =
            await getDoc(userRef);


        let name =
            currentUser.displayName ||
            "User";


        if (snapshot.exists()) {

            const data =
                snapshot.data();


            if (data.name) {

                name =
                    data.name;

            }

        }


        const userName =
            document.getElementById(
                "userName"
            );


        const welcomeName =
            document.getElementById(
                "welcomeName"
            );


        const topbarName =
            document.getElementById(
                "topbarName"
            );


        const profileAvatar =
            document.getElementById(
                "profileAvatar"
            );


        const topbarAvatar =
            document.getElementById(
                "topbarAvatar"
            );


        if (userName) {

            userName.textContent =
                name;

        }


        if (welcomeName) {

            welcomeName.textContent =
                name;

        }


        if (topbarName) {

            topbarName.textContent =
                name;

        }


        if (profileAvatar) {

            profileAvatar.textContent =
                name
                    .charAt(0)
                    .toUpperCase();

        }


        if (topbarAvatar) {

            topbarAvatar.textContent =
                name
                    .charAt(0)
                    .toUpperCase();

        }

    } catch (error) {

        console.error(
            "PROFILE ERROR:",
            error
        );

    }

}


/* =========================================
   LOAD EXPENSES
========================================= */

async function loadExpenses() {

    if (!currentUser) return;


    try {

        const expensesRef =
            collection(
                db,
                "users",
                currentUser.uid,
                "expenses"
            );


        const expensesQuery =
            query(
                expensesRef,
                orderBy(
                    "date",
                    "desc"
                )
            );


        const snapshot =
            await getDocs(
                expensesQuery
            );


        expenses = [];


        snapshot.forEach(
            function (document) {

                expenses.push({

                    id: document.id,

                    ...document.data()

                });

            }
        );


        console.log(
            "Expenses loaded:",
            expenses
        );


    } catch (error) {

        console.error(
            "LOAD EXPENSES ERROR:",
            error
        );


        expenses = [];

    }

}


/* =========================================
   SAVE EXPENSE
========================================= */

async function saveExpense(event) {

    event.preventDefault();


    if (!currentUser) {

        alert(
            "You are not signed in. Please log in again."
        );

        return;

    }


    const name =
        document
            .getElementById(
                "expenseName"
            )
            .value
            .trim();


    const amount =
        parseFloat(
            document
                .getElementById(
                    "expenseAmount"
                )
                .value
        );


    const date =
        document
            .getElementById(
                "expenseDate"
            )
            .value;


    const category =
        document
            .getElementById(
                "expenseCategory"
            )
            .value;


    const description =
        document
            .getElementById(
                "expenseDescription"
            )
            .value
            .trim();


    /* VALIDATION */

    if (!name) {

        alert(
            "Please enter an expense name."
        );

        return;

    }


    if (
        isNaN(amount) ||
        amount <= 0
    ) {

        alert(
            "Please enter a valid expense amount."
        );

        return;

    }


    if (!date) {

        alert(
            "Please select a date."
        );

        return;

    }


    if (!category) {

        alert(
            "Please select a category."
        );

        return;

    }


    try {

        /* =====================================
           UPDATE
        ====================================== */

        if (editingExpenseId) {

            const expenseRef =
                doc(
                    db,
                    "users",
                    currentUser.uid,
                    "expenses",
                    editingExpenseId
                );


            await updateDoc(
                expenseRef,
                {

                    name:
                        name,

                    amount:
                        amount,

                    date:
                        date,

                    category:
                        category,

                    description:
                        description,

                    updatedAt:
                        serverTimestamp()

                }
            );


            const index =
                expenses.findIndex(
                    function (expense) {

                        return (
                            expense.id ===
                            editingExpenseId
                        );

                    }
                );


            if (index !== -1) {

                expenses[index] = {

                    ...expenses[index],

                    name:
                        name,

                    amount:
                        amount,

                    date:
                        date,

                    category:
                        category,

                    description:
                        description

                };

            }


            alert(
                "Expense updated successfully."
            );

        }


        /* =====================================
           CREATE
        ====================================== */

        else {

            const expensesRef =
                collection(
                    db,
                    "users",
                    currentUser.uid,
                    "expenses"
                );


            const newExpense =
                await addDoc(
                    expensesRef,
                    {

                        name:
                            name,

                        amount:
                            amount,

                        date:
                            date,

                        category:
                            category,

                        description:
                            description,

                        createdAt:
                            serverTimestamp()

                    }
                );


            expenses.push({

                id:
                    newExpense.id,

                name:
                    name,

                amount:
                    amount,

                date:
                    date,

                category:
                    category,

                description:
                    description

            });


            sortExpenses();


            alert(
                "Expense added successfully."
            );

        }


        closeExpenseModal();


        refreshEverything();


        /* Refresh current section */

        const activeSection =
            document.querySelector(
                ".page-section.active-section"
            );


        if (
            activeSection &&
            activeSection.id ===
                "expensesSection"
        ) {

            renderAllExpenses();

        }


        if (
            activeSection &&
            activeSection.id ===
                "categoriesSection"
        ) {

            renderFullCategories();

        }


    } catch (error) {

        console.error(
            "SAVE EXPENSE ERROR:",
            error
        );


        alert(
            "Unable to save the expense.\n\n" +
            "Code: " +
            error.code +
            "\n\n" +
            "Message: " +
            error.message
        );

    }

}


/* =========================================
   SORT EXPENSES
========================================= */

function sortExpenses() {

    expenses.sort(
        function (a, b) {

            const dateA =
                parseExpenseDate(
                    a.date
                );


            const dateB =
                parseExpenseDate(
                    b.date
                );


            if (!dateA) return 1;

            if (!dateB) return -1;


            return (
                dateB - dateA
            );

        }
    );

}


/* =========================================
   OPEN ADD MODAL
========================================= */

function openAddExpenseModal() {

    editingExpenseId =
        null;


    const form =
        document.getElementById(
            "expenseForm"
        );


    const modal =
        document.getElementById(
            "expenseModal"
        );


    const title =
        document.querySelector(
            "#expenseModal .modal-header h3"
        );


    if (form) {

        form.reset();

    }


    if (title) {

        title.textContent =
            "Add Expense";

    }


    const dateInput =
        document.getElementById(
            "expenseDate"
        );


    if (dateInput) {

        dateInput.value =
            new Date()
                .toISOString()
                .split("T")[0];

    }


    if (modal) {

        modal.classList.add(
            "active"
        );

    }

}


/* =========================================
   OPEN EDIT MODAL
========================================= */

function openEditExpenseModal(
    expenseId
) {

    const expense =
        expenses.find(
            function (item) {

                return (
                    item.id ===
                    expenseId
                );

            }
        );


    if (!expense) {

        alert(
            "Expense could not be found."
        );

        return;

    }


    editingExpenseId =
        expenseId;


    const modal =
        document.getElementById(
            "expenseModal"
        );


    const title =
        document.querySelector(
            "#expenseModal .modal-header h3"
        );


    if (title) {

        title.textContent =
            "Edit Expense";

    }


    document.getElementById(
        "expenseName"
    ).value =
        expense.name || "";


    document.getElementById(
        "expenseAmount"
    ).value =
        expense.amount || "";


    document.getElementById(
        "expenseDate"
    ).value =
        expense.date || "";


    document.getElementById(
        "expenseCategory"
    ).value =
        expense.category || "";


    document.getElementById(
        "expenseDescription"
    ).value =
        expense.description || "";


    if (modal) {

        modal.classList.add(
            "active"
        );

    }

}


/* =========================================
   CLOSE MODAL
========================================= */

function closeExpenseModal() {

    const modal =
        document.getElementById(
            "expenseModal"
        );


    const form =
        document.getElementById(
            "expenseForm"
        );


    const title =
        document.querySelector(
            "#expenseModal .modal-header h3"
        );


    if (modal) {

        modal.classList.remove(
            "active"
        );

    }


    if (form) {

        form.reset();

    }


    if (title) {

        title.textContent =
            "Add Expense";

    }


    editingExpenseId =
        null;

}


/* =========================================
   REFRESH EVERYTHING
========================================= */

function refreshEverything() {

    updateSummaryCards();

    updateRecentExpenses();

    updateCategories();

    renderSpendingChart();

    renderAllExpenses();

    renderFullCategories();

}


/* =========================================
   SUMMARY CARDS
========================================= */

function updateSummaryCards() {

    const totalElement =
        document.getElementById(
            "totalExpenses"
        );


    const monthlyElement =
        document.getElementById(
            "monthlyExpenses"
        );


    const transactionElement =
        document.getElementById(
            "transactionCount"
        );


    const topCategoryElement =
        document.getElementById(
            "topCategory"
        );


    let total =
        0;


    expenses.forEach(
        function (expense) {

            total +=
                Number(
                    expense.amount
                ) || 0;

        }
    );


    if (totalElement) {

        totalElement.textContent =
            formatCurrency(
                total
            );

    }


    const now =
        new Date();


    const currentMonth =
        now.getMonth();


    const currentYear =
        now.getFullYear();


    let monthlyTotal =
        0;


    expenses.forEach(
        function (expense) {

            const date =
                parseExpenseDate(
                    expense.date
                );


            if (
                date &&
                date.getMonth() ===
                    currentMonth &&
                date.getFullYear() ===
                    currentYear
            ) {

                monthlyTotal +=
                    Number(
                        expense.amount
                    ) || 0;

            }

        }
    );


    if (monthlyElement) {

        monthlyElement.textContent =
            formatCurrency(
                monthlyTotal
            );

    }


    if (transactionElement) {

        transactionElement.textContent =
            expenses.length;

    }


    const categoryTotals =
        {};


    expenses.forEach(
        function (expense) {

            const category =
                expense.category ||
                "Other";


            if (
                !categoryTotals[
                    category
                ]
            ) {

                categoryTotals[
                    category
                ] =
                    0;

            }


            categoryTotals[
                category
            ] +=
                Number(
                    expense.amount
                ) || 0;

        }
    );


    let highest =
        0;


    let highestCategory =
        "—";


    Object.keys(
        categoryTotals
    ).forEach(
        function (category) {

            if (
                categoryTotals[
                    category
                ] > highest
            ) {

                highest =
                    categoryTotals[
                        category
                    ];

                highestCategory =
                    category;

            }

        }
    );


    if (topCategoryElement) {

        topCategoryElement.textContent =
            highestCategory;

    }

}


/* =========================================
   RECENT EXPENSES
========================================= */

function updateRecentExpenses() {

    const tableBody =
        document.getElementById(
            "expenseTableBody"
        );


    if (!tableBody) return;


    if (expenses.length === 0) {

        tableBody.innerHTML = `

            <tr>

                <td
                    colspan="5"
                    class="empty-table"
                >
                    No expenses yet.
                </td>

            </tr>

        `;

        return;

    }


    const recent =
        expenses.slice(
            0,
            5
        );


    tableBody.innerHTML =
        "";


    recent.forEach(
        function (expense) {

            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

                <td>

                    <strong>
                        ${escapeHTML(
                            expense.name ||
                            "Unnamed"
                        )}
                    </strong>

                </td>

                <td>

                    ${escapeHTML(
                        expense.category ||
                        "Other"
                    )}

                </td>

                <td>

                    ${formatDate(
                        expense.date
                    )}

                </td>

                <td>

                    ${formatCurrency(
                        expense.amount
                    )}

                </td>

                <td>

                    <div class="expense-actions">

                        <button
                            type="button"
                            class="expense-edit-btn"
                            data-id="${expense.id}"
                        >
                            Edit
                        </button>

                        <button
                            type="button"
                            class="expense-delete-btn"
                            data-id="${expense.id}"
                        >
                            Delete
                        </button>

                    </div>

                </td>

            `;


            tableBody.appendChild(
                row
            );

        }
    );


    attachExpenseActions(
        tableBody
    );

}


/* =========================================
   ALL EXPENSES
========================================= */

function renderAllExpenses() {

    const tableBody =
        document.getElementById(
            "allExpensesTableBody"
        );


    if (!tableBody) return;


    if (expenses.length === 0) {

        tableBody.innerHTML = `

            <tr>

                <td
                    colspan="5"
                    class="empty-table"
                >
                    No expenses recorded yet.
                </td>

            </tr>

        `;

        return;

    }


    tableBody.innerHTML =
        "";


    expenses.forEach(
        function (expense) {

            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

                <td>

                    <strong>
                        ${escapeHTML(
                            expense.name ||
                            "Unnamed"
                        )}
                    </strong>

                </td>

                <td>

                    ${escapeHTML(
                        expense.category ||
                        "Other"
                    )}

                </td>

                <td>

                    ${formatDate(
                        expense.date
                    )}

                </td>

                <td>

                    ${formatCurrency(
                        expense.amount
                    )}

                </td>

                <td>

                    <div class="expense-actions">

                        <button
                            type="button"
                            class="expense-edit-btn"
                            data-id="${expense.id}"
                        >
                            Edit
                        </button>

                        <button
                            type="button"
                            class="expense-delete-btn"
                            data-id="${expense.id}"
                        >
                            Delete
                        </button>

                    </div>

                </td>

            `;


            tableBody.appendChild(
                row
            );

        }
    );


    attachExpenseActions(
        tableBody
    );

}


/* =========================================
   ATTACH EDIT / DELETE
========================================= */

function attachExpenseActions(
    container
) {

    container
        .querySelectorAll(
            ".expense-edit-btn"
        )
        .forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        openEditExpenseModal(
                            button.dataset.id
                        );

                    }
                );

            }
        );


    container
        .querySelectorAll(
            ".expense-delete-btn"
        )
        .forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        deleteExpense(
                            button.dataset.id
                        );

                    }
                );

            }
        );

}


/* =========================================
   DELETE EXPENSE
========================================= */

async function deleteExpense(
    expenseId
) {

    const expense =
        expenses.find(
            function (item) {

                return (
                    item.id ===
                    expenseId
                );

            }
        );


    if (!expense) {

        alert(
            "Expense could not be found."
        );

        return;

    }


    const confirmed =
        confirm(
            `Are you sure you want to delete "${expense.name}"?\n\n` +
            `Amount: ${formatCurrency(
                expense.amount
            )}\n\n` +
            `This action cannot be undone.`
        );


    if (!confirmed) {

        return;

    }


    try {

        const expenseRef =
            doc(
                db,
                "users",
                currentUser.uid,
                "expenses",
                expenseId
            );


        await deleteDoc(
            expenseRef
        );


        expenses =
            expenses.filter(
                function (item) {

                    return (
                        item.id !==
                        expenseId
                    );

                }
            );


        refreshEverything();


        alert(
            "Expense deleted successfully."
        );


    } catch (error) {

        console.error(
            "DELETE ERROR:",
            error
        );


        alert(
            "Unable to delete the expense.\n\n" +
            error.message
        );

    }

}


/* =========================================
   CATEGORIES PREVIEW
========================================= */

function updateCategories() {

    const container =
        document.getElementById(
            "categoryList"
        );


    if (!container) return;


    const totals =
        {};


    expenses.forEach(
        function (expense) {

            const category =
                expense.category ||
                "Other";


            if (!totals[category]) {

                totals[category] =
                    0;

            }


            totals[category] +=
                Number(
                    expense.amount
                ) || 0;

        }
    );


    const categories =
        Object.keys(
            totals
        );


    if (!categories.length) {

        container.innerHTML = `

            <div class="empty-state">

                <p>
                    No spending categories yet.
                </p>

            </div>

        `;

        return;

    }


    categories.sort(
        function (a, b) {

            return (
                totals[b] -
                totals[a]
            );

        }
    );


    container.innerHTML =
        "";


    categories.forEach(
        function (category) {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "category-item";


            item.innerHTML = `

                <div>

                    <strong>
                        ${escapeHTML(
                            category
                        )}
                    </strong>

                </div>

                <span>
                    ${formatCurrency(
                        totals[category]
                    )}
                </span>

            `;


            container.appendChild(
                item
            );

        }
    );

}


/* =========================================
   FULL CATEGORIES
========================================= */

function renderFullCategories() {

    const container =
        document.getElementById(
            "fullCategoryList"
        );


    if (!container) return;


    const categories =
        {};


    expenses.forEach(
        function (expense) {

            const category =
                expense.category ||
                "Other";


            if (!categories[category]) {

                categories[category] = {

                    amount: 0,

                    count: 0

                };

            }


            categories[category].amount +=
                Number(
                    expense.amount
                ) || 0;


            categories[category].count++;

        }
    );


    const names =
        Object.keys(
            categories
        );


    if (!names.length) {

        container.innerHTML = `

            <div class="empty-state">

                <p>
                    No categories yet.
                </p>

            </div>

        `;

        return;

    }


    names.sort(
        function (a, b) {

            return (
                categories[b].amount -
                categories[a].amount
            );

        }
    );


    container.innerHTML =
        "";


    names.forEach(
        function (category) {

            const data =
                categories[category];


            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "category-card";


            card.innerHTML = `

                <div class="category-card-name">

                    ${escapeHTML(
                        category
                    )}

                </div>

                <div class="category-card-amount">

                    ${formatCurrency(
                        data.amount
                    )}

                </div>

                <div class="category-card-count">

                    ${data.count}

                    ${
                        data.count === 1
                            ? "transaction"
                            : "transactions"
                    }

                </div>

            `;


            container.appendChild(
                card
            );

        }
    );

}


/* =========================================
   SETTINGS
========================================= */

function initializeSettings() {

    const logoutBtn =
        document.getElementById(
            "logoutBtn"
        );


    const settingsLogoutBtn =
        document.getElementById(
            "settingsLogoutBtn"
        );


    const settingsProfileBtn =
        document.getElementById(
            "settingsProfileBtn"
        );


    if (logoutBtn) {

        logoutBtn.addEventListener(
            "click",
            logoutUser
        );

    }


    if (settingsLogoutBtn) {

        settingsLogoutBtn.addEventListener(
            "click",
            logoutUser
        );

    }


    if (settingsProfileBtn) {

        settingsProfileBtn.addEventListener(
            "click",
            function () {

                alert(
                    "Profile editing can be added here."
                );

            }
        );

    }

}


/* =========================================
   LOGOUT
========================================= */

async function logoutUser() {

    try {

        await signOut(
            auth
        );


        window.location.href =
            "login.html";


    } catch (error) {

        console.error(
            "LOGOUT ERROR:",
            error
        );


        alert(
            "Unable to log out. Please try again."
        );

    }

}


/* =========================================
   SPENDING CHART
========================================= */

function renderSpendingChart() {

    const container =
        document.getElementById(
            "spendingChart"
        );


    if (!container) return;


    const filter =
        document.getElementById(
            "chartFilter"
        )?.value ||
        "month";


    const data =
        filter === "all"
            ? getAllTimeChartData()
            : getCurrentMonthChartData();


    const hasSpending =
        data.some(
            function (item) {

                return (
                    item.amount > 0
                );

            }
        );


    if (!hasSpending) {

        container.innerHTML = `

            <div class="chart-empty">

                <div class="chart-empty-icon">
                    ₱
                </div>

                <h4>
                    No spending data yet
                </h4>

                <p>
                    Add your first expense
                    to start tracking
                    your spending.
                </p>

                <button
                    type="button"
                    id="chartAddExpenseBtn"
                >
                    Add an expense
                </button>

            </div>

        `;


        const button =
            document.getElementById(
                "chartAddExpenseBtn"
            );


        if (button) {

            button.addEventListener(
                "click",
                openAddExpenseModal
            );

        }


        return;

    }


    const width =
        900;


    const height =
        330;


    const left =
        65;


    const right =
        25;


    const top =
        30;


    const bottom =
        55;


    const chartWidth =
        width -
        left -
        right;


    const chartHeight =
        height -
        top -
        bottom;


    const max =
        Math.max(
            ...data.map(
                function (item) {

                    return item.amount;

                }
            ),
            1
        );


    const points =
        data.map(
            function (item, index) {

                const x =
                    left +
                    (
                        index /
                        Math.max(
                            data.length - 1,
                            1
                        )
                    ) *
                    chartWidth;


                const y =
                    top +
                    chartHeight -
                    (
                        item.amount /
                        max
                    ) *
                    chartHeight;


                return {

                    x:
                        x,

                    y:
                        y,

                    amount:
                        item.amount,

                    label:
                        item.label

                };

            }
        );


    const line =
        points
            .map(
                function (point) {

                    return (
                        point.x +
                        "," +
                        point.y
                    );

                }
            )
            .join(" ");


    let grid =
        "";


    for (
        let i = 0;
        i <= 4;
        i++
    ) {

        const y =
            top +
            (
                chartHeight /
                4
            ) *
            i;


        const value =
            max -
            (
                max /
                4
            ) *
            i;


        grid += `

            <line
                x1="${left}"
                y1="${y}"
                x2="${left + chartWidth}"
                y2="${y}"
                class="chart-grid-line"
            />

            <text
                x="${left - 10}"
                y="${y + 4}"
                text-anchor="end"
                class="chart-axis-label"
            >
                ${formatCompactCurrency(
                    value
                )}
            </text>

        `;

    }


    let labels =
        "";


    points.forEach(
        function (point, index) {

            const interval =
                Math.max(
                    Math.ceil(
                        data.length /
                        6
                    ),
                    1
                );


            if (
                data.length <= 12 ||
                index === 0 ||
                index ===
                    data.length - 1 ||
                index % interval === 0
            ) {

                labels += `

                    <text
                        x="${point.x}"
                        y="${height - 18}"
                        text-anchor="middle"
                        class="chart-axis-label"
                    >
                        ${escapeHTML(
                            point.label
                        )}
                    </text>

                `;

            }

        }
    );


    let circles =
        "";


    points.forEach(
        function (point) {

            circles += `

                <circle
                    cx="${point.x}"
                    cy="${point.y}"
                    r="5"
                    class="chart-point"
                >

                    <title>

                        ${escapeHTML(
                            point.label
                        )}

                        —

                        ${formatCurrency(
                            point.amount
                        )}

                    </title>

                </circle>

            `;

        }
    );


    container.innerHTML = `

        <svg
            class="spending-chart-svg"
            viewBox="0 0 ${width} ${height}"
            preserveAspectRatio="none"
        >

            ${grid}

            <polyline
                points="${line}"
                class="chart-line"
            />

            ${circles}

            ${labels}

        </svg>

    `;

}


/* =========================================
   CURRENT MONTH DATA
========================================= */

function getCurrentMonthChartData() {

    const now =
        new Date();


    const year =
        now.getFullYear();


    const month =
        now.getMonth();


    const days =
        new Date(
            year,
            month + 1,
            0
        ).getDate();


    const totals =
        {};


    for (
        let day = 1;
        day <= days;
        day++
    ) {

        totals[day] =
            0;

    }


    expenses.forEach(
        function (expense) {

            const date =
                parseExpenseDate(
                    expense.date
                );


            if (!date) return;


            if (
                date.getFullYear() ===
                    year &&
                date.getMonth() ===
                    month
            ) {

                totals[
                    date.getDate()
                ] +=
                    Number(
                        expense.amount
                    ) || 0;

            }

        }
    );


    return Object.keys(
        totals
    ).map(
        function (day) {

            return {

                label:
                    day,

                amount:
                    totals[day]

            };

        }
    );

}


/* =========================================
   ALL TIME DATA
========================================= */

function getAllTimeChartData() {

    const totals =
        {};


    expenses.forEach(
        function (expense) {

            const date =
                parseExpenseDate(
                    expense.date
                );


            if (!date) return;


            const key =
                date.getFullYear() +
                "-" +
                String(
                    date.getMonth() + 1
                ).padStart(
                    2,
                    "0"
                );


            if (!totals[key]) {

                totals[key] =
                    0;

            }


            totals[key] +=
                Number(
                    expense.amount
                ) || 0;

        }
    );


    return Object.keys(
        totals
    )
    .sort()
    .map(
        function (key) {

            const parts =
                key.split("-");


            const year =
                Number(
                    parts[0]
                );


            const month =
                Number(
                    parts[1]
                ) - 1;


            return {

                label:
                    new Date(
                        year,
                        month,
                        1
                    ).toLocaleDateString(
                        "en-PH",
                        {
                            month:
                                "short",

                            year:
                                "numeric"
                        }
                    ),

                amount:
                    totals[key]

            };

        }
    );

}


/* =========================================
   DATE
========================================= */

function parseExpenseDate(
    dateString
) {

    if (!dateString) {

        return null;

    }


    const date =
        new Date(
            dateString +
            "T00:00:00"
        );


    if (
        isNaN(
            date.getTime()
        )
    ) {

        return null;

    }


    return date;

}


/* =========================================
   FORMAT CURRENCY
========================================= */

function formatCurrency(
    amount
) {

    return (
        "₱" +
        Number(
            amount || 0
        ).toLocaleString(
            "en-PH",
            {
                minimumFractionDigits:
                    2,

                maximumFractionDigits:
                    2

            }
        )
    );

}


/* =========================================
   COMPACT CURRENCY
========================================= */

function formatCompactCurrency(
    amount
) {

    const value =
        Number(
            amount
        ) || 0;


    if (value >= 1000000) {

        return (
            "₱" +
            (
                value /
                1000000
            ).toFixed(1) +
            "M"
        );

    }


    if (value >= 1000) {

        return (
            "₱" +
            (
                value /
                1000
            ).toFixed(1) +
            "K"
        );

    }


    return (
        "₱" +
        Math.round(
            value
        )
    );

}


/* =========================================
   FORMAT DATE
========================================= */

function formatDate(
    dateString
) {

    const date =
        parseExpenseDate(
            dateString
        );


    if (!date) {

        return "—";

    }


    return date.toLocaleDateString(
        "en-PH",
        {
            month:
                "short",

            day:
                "numeric",

            year:
                "numeric"
        }
    );

}


/* =========================================
   ESCAPE HTML
========================================= */

function escapeHTML(
    value
) {

    return String(
        value
    )

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}