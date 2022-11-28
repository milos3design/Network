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


function load_posts(type, id_view, page_no) { 
    
    const user_username = JSON.parse(document.getElementById('user_username').textContent);
    console.log(`view: ${id_view}`);
    console.log(`page number: ${page_no}`);
    // GET the posts from the backend
    fetch(`/posts/${type}/${page_no}`)
    .then(response => response.json())
    .then(payload => {
        // Print posts
        console.log('data:');
        console.log(payload.data);
        // Show all posts
        payload.data.forEach(spost => {
            let partHTML ='';
            var element = document.createElement('div');
            element.style.position = 'relative';
            element.id = `post_box_id_${spost.id}`;
            // Make cards for each post
            partHTML = `
            <div class="card bg-light mt-3">
            <div class="card-header">
            <div class="row">
            <div class="col-8"><a href="./profile/${spost.author}"><strong>${spost.author}</strong></a></div>`;

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
                <div class="card-footer">
                    <div class="row ml-1">`;

            // Like - Unlike functionality
            if (spost.likers.includes(user_username)) {
                partHTML += `
                    <div class="col-6 row">
                        <button class="border-0" id="like" value=${spost.id}>
                            <div id="h_${spost.id}">❤️</div>
                        </button>`;
            } else {
                partHTML += `
                    <div class="col-6 row">
                        <button class="border-0" id="like" value=${spost.id}>
                            <div id="h_${spost.id}">🤍</div>
                        </button>`;
            }
            partHTML += `
                    <div id="l_${spost.id}">${spost.likers.length}</div>
                        </div>
                        <small class="col-6 text-right">${spost.timestamp}</small>
                    </div>
                </div>
            </div>`;

            // Append constructed HTML to 'posts_view' div in HTML file
            element.innerHTML = partHTML;
            document.querySelector(`#${id_view}`).append(element);
        });
        // Print pagination details
        console.log(payload.page);
        // Paginate navigation
        // Create pagination div element
        const paginate_nav = document.createElement('div');
        paginate_nav.className = 'd-flex justify-content-center text-center mt-3';
        paginationHTML = '<ul class="pagination">';
        if (payload.page.has_previous) {
            paginationHTML += `
            <li class="page-item" id="page_id" value="${parseInt(payload.page.current)-1}">
                <a class="page-link" href="#">&laquo;</a>
            </li>
            `;
        }
        paginationHTML += `
        <li class="current page-item">
            <a class="page-link">Page ${payload.page.current} of ${payload.page.total_pages}</a>
        </li>
        `;
        if (payload.page.has_next) {
            paginationHTML += `
            <li class="page-item" id="page_id" value="${parseInt(payload.page.current)+1}">
                <a class="page-link" href="#">&raquo;</a>
            </li>
            `;
        }
        paginate_nav.innerHTML = paginationHTML;
        document.querySelector(`#${id_view}`).append(paginate_nav);

        // Listen for "pagination" buttons click. On click, get
        // the page id (this.value)
        document.querySelectorAll('#page_id').forEach(btn => {
            btn.addEventListener('click', function() {
                var box = document.getElementById(`${id_view}`);
                box.parentNode.removeChild(box);
                const make_new_box = document.createElement('div');
                make_new_box.id = id_view;
                document.querySelector(`#main_box`).append(make_new_box);
                page_no = this.value;
                load_posts(type, id_view, page_no)
              
            });
        });

        // Listen for "edit" button click. On click, get
        // the id of the post (this.value) and text from that post
        document.querySelectorAll('#btn_edit').forEach(btn => {
            btn.addEventListener('click', function() {
                // Get the post text from the id of the post
                post_text = document.querySelector(`#post_id_${this.value}`).innerHTML;
                // Call function using all arguments needed
                edit_post(this.value, post_text);
            });
        }); 

        // Listen for "like" button click. On click, get
        // the id of the post (this.value) and likers list
        if (user_username != 'anonimno') {
            document.querySelectorAll('#like').forEach(like => {
                like.addEventListener('click', function() {
                    // Call function using id and heart
                    heart = document.getElementById(`h_${this.value}`).innerHTML;
                    likes_no = document.getElementById(`l_${this.value}`).innerHTML;
                    like_post(this.value, heart, likes_no);
    
                });
            }); 
        } 
    });
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
            fetch('/edit', {
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


function like_post(id, heart) {
    fetch('/like', {
        method: 'PUT',
        headers: {'X-CSRFToken': document.getElementById('csrf').querySelector('input').value},
            body: JSON.stringify({
                id: id,
            })
    })
    .then(response => response.json())
    .then(result => {
        // Print message
        console.log(result);
        // Don't reload whole page, only update heart icon and number of likes
        likes_no = parseInt(document.getElementById(`l_${id}`).innerHTML);
        if (heart === '🤍') {
            likes_no += 1;
            document.getElementById(`h_${id}`).innerHTML = '❤️';
            document.getElementById(`l_${id}`).innerHTML = likes_no;
        } else if (heart === '❤️') {
            likes_no -= 1;
            document.getElementById(`h_${id}`).innerHTML = '🤍';
            document.getElementById(`l_${id}`).innerHTML = likes_no;
        } else {
            location.reload();
        }
    });
}


function show_all_posts(id_view, page_no) {
    compose_box();
    // On start, page is set to 1. On pagebutton click page_no gets defined
    if (page_no == undefined) {
        load_posts('all', id_view, 1);
    } else {
        load_posts('all', id_view, page_no);
    }
}


function profile_posts(id_view, page_no) {
    // Another method to get the data from backend
    // https://docs.djangoproject.com/en/4.0/ref/templates/builtins/#json-script
    const profile_username = JSON.parse(document.getElementById('profile_username').textContent);
    const able_to_follow = JSON.parse(document.getElementById('able_to_follow').textContent);
    const following_number = JSON.parse(document.getElementById('following_number').textContent);
    const followers_number = JSON.parse(document.getElementById('followers_number').textContent);

    const user_username = JSON.parse(document.getElementById('user_username').textContent);

    const profile = document.createElement('div');
    profile.className = 'card mt-4 mb-3 p-2';
    let partHTML = `
        <div class="row">
            <div class="col-4">
                <h3 class="pt-4 pl-4">${profile_username.toUpperCase()}</h3>`;

    // Follow or Unfollow
    if (able_to_follow === "yes") {
        partHTML += `
            <button class="btn btn-primary btn-sm ml-4" id="btn_follow">Follow</button>
        `;
    } else if (able_to_follow === "no") {
        partHTML += `
            <button class="btn btn-primary btn-sm ml-4" id="btn_follow">Unfollow</button>
        `;
    } else {
        partHTML += ``;
    }
    partHTML += `
            </div>
            <div class="col-4">
                <h6 class="pt-4">Following</h6>
                <p>${following_number}</p>
            </div>
            <div class="col-4">
                <h6 class="pt-4">Followers</h6>
                <p>${followers_number}</p>
            </div>
        </div>
        `;
    profile.innerHTML = partHTML
    document.querySelector('#profile_stats').append(profile);

    // Fetch data using the PUT method
    if (document.querySelector('#btn_follow') != null) { 
        document.querySelector('#btn_follow').onclick = function() {
            console.log('click');
            fetch('/follow', {
                method: 'PUT',
                headers: {'X-CSRFToken': document.getElementById('csrf').querySelector('input').value},
                    body: JSON.stringify({
                        user_username: user_username,
                        profile_username: profile_username
                    })
            })
            .then(response => response.json())
            .then(result => {
                // Print message
                console.log(result);
                // Reload page
                location.reload()
            });
            return false;
        }
    }

    if (profile_username === user_username) {
        compose_box();
    }
    if (page_no == undefined) {
        load_posts(profile_username, id_view, 1);
    } else {
        load_posts(profile_username, id_view, page_no);
    }
}


function following_posts(id_view, page_no) {

    if (page_no == undefined) {
        load_posts('following', id_view, 1);
    } else {
        load_posts('following', id_view, page_no);
    }

}


function compose_box_fetch() {
    const user_username = JSON.parse(document.getElementById('user_username').textContent);
    document.querySelector('#compose_id').onsubmit = function() {
        const text = document.querySelector('#compose-text').value;
        // Send data to backend using POST method - create new post
        fetch('/compose', {
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