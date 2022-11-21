document.addEventListener('DOMContentLoaded', function() {

    if (document.querySelector('#posts_view') != null) {

        const view_type = 'posts_view';
        show_all_posts(tip=view_type);

        if (document.querySelector('#compose-id') != null) {
            document.querySelector('#compose-id').onsubmit = function() {

                const user_username = JSON.parse(document.getElementById('user_username').textContent);
                const text = document.querySelector('#compose-text').value;
                console.log(user_username);
                console.log(text);
                // Send data to Django
                fetch('compose', {
                    method: 'POST',
                    headers: {'X-CSRFToken': document.getElementById('csrf').querySelector('input').value},
                    body: JSON.stringify({
                        author: user_username,
                        text: text
                    })
                })
                .then(response => response.json())
                .then(result => {
                    // Print result
                    console.log('ok je');
                    location.reload()
                    
                });
                return false;
            }
        }
    }
    if (document.querySelector('#following_view') != null) {
        const view_type = 'following_view';
        following_posts(tip=view_type); 
    }
});


function compose_box() {

    // Get username of the logged in user
    // If user is not logged in, index.html posts_view returns "anonimno"
    const user_username = JSON.parse(document.getElementById('user_username').textContent);
    
    // If user is logged in, create compose box
    if (user_username != 'anonimno') {
        const compose = document.createElement('form');
        compose.id = 'compose-id';
        compose.name ='csrfToken';
        compose.method = 'post';
        compose.innerHTML = `
        <textarea class="form-control mt-4 mb-1" placeholder="What's happening?" rows="2" id="compose-text"></textarea>
        <input type="submit" class="btn btn-primary mb-2" value="Post"/>
        `;
        document.querySelector('#compose_view').append(compose);
    }
}


function load_posts(type, view_type) {

    // Get username of the logged in user
    // If user is not logged in, index.html posts_view returns "anonimno"
    const user_username = JSON.parse(document.getElementById('user_username').textContent);

    // GET the emails from the backend
    fetch(`/posts/${type}`)
    .then(response => response.json())
    .then(posts => {
        // Print posts
        console.log(posts);

        // Show all posts
        posts.forEach(spost => {
            const element = document.createElement('div');

            // Make divs out of post data
            let partHTML = `
            <div class="card text-white bg-primary mt-3">
            <div class="card-header">
            <div class="row">
            <div>${spost.author}</div>`;

            // If logged in user is the author, add edit button
            if (spost.author == user_username) {
                partHTML += `<button type="submit" class="btn btn-primary ml-2 btn-sm" id="btn_edit">Edit</button>`;
            } else {
                partHTML += '';
            }
            partHTML += `
            </div>
            </div>
            <div class="card-body">${spost.text}</div>
            <div class="card-footer">${spost.likers.length}</div>
            </div>`;

            // Append constructed HTML to posts view
            element.innerHTML = partHTML;
            document.querySelector(`#${view_type}`).append(element);
        });
    });
}


function show_all_posts() {
    compose_box();
    load_posts('all', tip);
}


function following_posts() {
    
    load_posts('following', tip);
}