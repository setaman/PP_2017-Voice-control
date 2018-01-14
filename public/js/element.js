function buildElement(selector) {
    $(selector).each(function () {
       let element = $(this);
       let text;
       if($(this).text()){
           text = $(this).text();
       }

    });
    return elements
}