function compose_box() {

    // Get username of the logged in user
    // If user is not logged in, index.html posts_view returns "anonimno"
    const user_username = JSON.parse(document.getElementById('user_username').textContent);
    
    // If user is logged in, create compose box
    if (user_username != 'anonimno') {
        const compose = document.createElement('form');
        compose.id = 'compose-id';
        compose.name ='csrfToken';
        compose.method = 'POST';
        compose.innerHTML = `
        <textarea class="form-control mt-4 mb-1" placeholder="What's happening?" rows="2" id="compose-text"></textarea>
        <input type="submit" class="btn btn-primary mb-2" value="Post"/>
        `;
        document.querySelector('#compose_view').append(compose);
    }
}


function load_posts(type, id_view) {

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
            element.style.position = 'relative';
            element.id = `post_box_id_${spost.id}`;
            // Make divs out of post data
            let partHTML = `
            <div class="card bg-light mt-3">
            <div class="card-header">
            <div class="row">
            <div class="col-8"><strong>${spost.author}</strong></div>`;

            // If logged in user is the author, add edit button
            if (spost.author == user_username) {
                partHTML += `
                <div class="col-4 text-right">
                <button class="btn btn-light btn-sm btn_edit" id="btn_edit" value=${spost.id}>Edit</button>
                </div>
                `;
            } else {
                partHTML += '';
            }
            partHTML += `
            </div>
            </div>
            <div class="card-body" id="post_id_${spost.id}">${spost.text}</div>
            <div class="card-footer">${spost.likers.length}</div>
            </div>`;

            // Append constructed HTML to posts view
            element.innerHTML = partHTML;
            document.querySelector(`#${id_view}`).append(element);
        });

        // Listen for "edit" button click. On click, get
        // the id of the post (this.value) and text from that post
        document.querySelectorAll('#btn_edit').forEach(btn => {
            btn.addEventListener('click', function() {
                // Get the post text from the id of the post
                post_text  = document.querySelector(`#post_id_${this.value}`).innerHTML;
                // Call function using all arguments needed
                edit_post(this.value, user_username, post_text);
            });
        }); 
    });
}


function show_all_posts() {
    compose_box();
    load_posts('all', id_view);
}


function following_posts() {
    load_posts('following', id_view);
}


function edit_post(id, username, text) {
    console.log(id, username, text);
    
    // Create new box for editing the post
    const edit_box = document.createElement('div');
    edit_box.className = 'edit_box';
    edit_box.id = `edit_id_${id}`;
    document.querySelector(`#post_id_${id}`).append(edit_box)
    // Create form inside the box
    const edit_input = document.createElement('form');
    edit_input.id = 'edit-id';
    edit_input.name ='csrfToken';
    edit_input.method = 'PUT';
    edit_input.innerHTML = `
    <textarea class="form-control mt-4 mb-1" rows="2" id="edit-text">${text}</textarea>
    <input type="submit" class="btn btn-primary mb-2" value="Post"/>
    <button class="btn btn-light mb-2" id="cancel">Cancel</button>
    `;
    document.querySelector(`#edit_id_${id}`).append(edit_input);

    // When edit box is created, listen for clicks
    // Clicking outside of the edit box or cancel removes the edit box
    document.addEventListener('mouseup', function(e) {
        var container = document.getElementById(`edit_id_${id}`);
        const cancel = document.querySelector('#cancel');
        const post = document.querySelector('#post');
        if (container && (!container.contains(e.target) || cancel.contains(e.target))) {
            container.parentNode.removeChild(container);
        }
    });
    if (document.querySelector('#edit-id') != null) { 
        document.querySelector('#edit-id').onsubmit = function() {
            const edit_text = document.querySelector('#edit-text').value;
            fetch('edit', {
                method: 'PUT',
                headers: {'X-CSRFToken': document.getElementById('csrf').querySelector('input').value},
                    body: JSON.stringify({
                        id: id,
                        text: edit_text
                    })
            })
            .then(response => response.json())
            .then(result => {
                // Reload page
                location.reload()
            });
            return false;
        }
    }
}


document.addEventListener('DOMContentLoaded', function() {

    if (document.querySelector('#posts_view') != null) {

        show_all_posts(id_view='posts_view');

        if (document.querySelector('#compose-id') != null) { 
            document.querySelector('#compose-id').onsubmit = function() {
                const user_username = JSON.parse(document.getElementById('user_username').textContent);
                const text = document.querySelector('#compose-text').value;
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
                    // Reload page
                    location.reload()
                });
                return false;
            }
        }
    }
    //When you click "Following" link, call following posts function
    if (document.querySelector('#following_view') != null) {
        following_posts(id_view='following_view'); 
    }
});