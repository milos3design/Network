function compose_box() {
    
    // Get username of the logged in user
    // If user is not logged in, index.html posts_view returns "anonimno"
    const user_username = JSON.parse(document.getElementById('user_username').textContent);
    
    // If user is logged in, create compose form
    if (user_username != 'anonimno') {
        const compose = document.createElement('form');
        compose.id = 'compose_id';
        compose.name ='csrfToken';
        compose.method = 'POST';
        compose.innerHTML = `
        <textarea class="form-control mt-4 mb-1" placeholder="What's happening?" rows="2" id="compose-text"></textarea>
        <input type="submit" class="btn btn-primary mb-2" value="Post"/>
        `;
        document.querySelector('#compose_view').append(compose);
    }
}


function edit_post(id, text) {
    
    // Create a new box for editing the post
    const edit_box = document.createElement('div');
    edit_box.className = 'edit_box';
    edit_box.id = `edit_id_${id}`;
    document.querySelector(`#post_id_${id}`).append(edit_box)

    // Create a form inside the box
    const edit_input = document.createElement('form');
    edit_input.id = 'edit_id';
    edit_input.name ='csrfToken';
    edit_input.method = 'PUT';
    edit_input.innerHTML = `
    <textarea class="form-control mt-4 mb-1" rows="2" id="edit_text">${text}</textarea>
    <input type="submit" class="btn btn-primary mb-2" value="Post"/>
    <button class="btn btn-light mb-2" id="cancel">Cancel</button>
    `;
    document.querySelector(`#edit_id_${id}`).append(edit_input);

    // When the edit box is created, listen for clicks
    // Clicking outside of the edit box or the cancel button, removes the edit box
    document.addEventListener('mouseup', function(e) {
        var container = document.getElementById(`edit_id_${id}`);
        const cancel = document.querySelector('#cancel');
        if (container && (!container.contains(e.target) || cancel.contains(e.target))) {
            container.parentNode.removeChild(container);
        }
    });
    // Fetch data using the PUT method
    if (document.querySelector('#edit_id') != null) { 
        document.querySelector('#edit_id').onsubmit = function() {
            const edit_text = document.querySelector('#edit_text').value;
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
                // Print message
                console.log(result);
                // Don't reload whole page, only update current post with the text
                document.getElementById(`post_id_${id}`).innerHTML = `${edit_text}`;
            });
            return false;
        }
    }
}


function load_posts(type, id_view) {
    
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
            <div class="col-8"><a href="http://localhost:8000/profile/${spost.author}"><strong>${spost.author}</strong></a></div>`;

            // If user is logged in, add edit button
            if (spost.author == user_username) {
                partHTML += `
                <div class="col-4 text-right">
                <button class="btn btn-light btn-sm" id="btn_edit" value=${spost.id}>Edit</button>
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

            // Append constructed HTML to 'posts_view' div in HTML file
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
                edit_post(this.value, post_text);
            });
        }); 
    });
}


function profile_posts() {
    const profile_username = JSON.parse(document.getElementById('profile_username').textContent);
    const user_username = JSON.parse(document.getElementById('user_username').textContent);
    //if (profile_username === user_username) {
    //    compose_box();
    //}
    load_posts(profile_username, id_view);
}


function compose_box_fetch() {
    const user_username = JSON.parse(document.getElementById('user_username').textContent);
    document.querySelector('#compose_id').onsubmit = function() {
        const text = document.querySelector('#compose-text').value;
        // Send data to backend using POST method - create new post
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


function show_all_posts() {
    compose_box();
    load_posts('all', id_view);
}


function following_posts() {
    load_posts('following', id_view);
}


document.addEventListener('DOMContentLoaded', function() {

    if (document.querySelector('#posts_view') != null) {
        // If div with the posts_view exists, call function to show all posts
        show_all_posts(id_view='posts_view');
    }

    // Clicking the "Following" link calls following posts function
    if (document.querySelector('#following_view') != null) {
        following_posts(id_view='following_view'); 
    }

    // Clicking on any usernme call functions that shows profile page elements
    if (document.querySelector('#profile_view') != null) { 
        profile_posts(id_view='profile_view')
    }

    // If compose  box is created, call function for "onsubmit" functionality
    if (document.querySelector('#compose_id') != null) { 
        compose_box_fetch()
    }
});