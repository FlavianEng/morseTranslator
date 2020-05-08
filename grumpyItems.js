const items = document.getElementsByClassName('key');

for (i of items) {
    i.addEventListener("click", function beGrumpy() {
        alert("Ouch bud ! It hurts !");
    });
}
