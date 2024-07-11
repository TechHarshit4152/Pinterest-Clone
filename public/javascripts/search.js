function SearchFunctionality() {

        let clutter = ""

            var input = document.querySelector(".UsernameSearch")
            var container = document.querySelector(".search-overlay-child")
            var searchInput = document.querySelector(".search-overlay")

            input.addEventListener("focus", function() {
                searchInput.style.display = "block"
            })

            container.addEventListener("blur", function() {
                searchInput.style.display = "none"
            })

            input.addEventListener("blur", function() {
                setTimeout(function() {
                    searchInput.style.display = "none"
                    // Add event listener after 1.5 seconds
                }, 500);
            })


            input.addEventListener("input", function() {
                axios.get(`/username/${input.value}`)
                .then(function(data) {
                    console.log(data)
                    clutter = "";
                    data.data.forEach(function(elem) {
                        clutter += `<a href="/User/${elem._id}" onclick="focus()" class="outline-none">
                    <div class="text-white flex items-center gap-2 mt-5 hover:bg-zinc-200">
                        <div class="image w-[35px] h-[35px] rounded-full ml-5 flex items-center justify-center overflow-hidden">
                            <i class="fa-solid fa-magnifying-glass" style="color: #454545;font-size: 13px;"></i>    
                        </div>
                        <div class="text text-black flex items-center">
                            <a href="/User/${elem._id}">${elem.username}</a>
                        </div>
                    </div>            
                    </a>`
                    })

                    container.innerHTML = clutter
                })
            })
}

SearchFunctionality()