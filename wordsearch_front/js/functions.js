const sidebar = document.querySelector("#sidebar")

document.querySelector("#sidebarClose").addEventListener("click", _ => {
    sidebar.style.left = "-100vw";
});

document.querySelector("#sidebarOpen").addEventListener("click", _ => {
    sidebar.style.left = "0";
});


//const form = document.querySelector('#userSignup');
//form.addEventListener('submit', (e) => {
//    e.preventDefault();
//
//    const formData = new FormData(form);
//    const entries = formData.entries();
//    let query = 'insert into User (username, password , firstName ,lastName ,familyName ,email, birthday) values (';
//
//    for (const [key, value] of entries) {
//        if (key == 'repeatPassword') {
//            continue;
//        }
//        query += `'${value}', `;
//
//    }
//    query += ');';
//    const lastIndex = query.lastIndexOf(',');
//    query = query.slice(0, lastIndex) + '' + query.slice(lastIndex + 1);
//
//    (async () => {
//        await fetch("http://localhost:3000/daw/" + encodeURIComponent(query));
//    })()
//});


async function select(query) {
    const api = await fetch("http://localhost:3000/daw/" + encodeURIComponent(query))
    const data = await api.json();
    return await data.data;
};

async function modify(query) {
    await fetch("http://localhost:3000/daw/" + encodeURIComponent(query));
}

export default { select, modify };