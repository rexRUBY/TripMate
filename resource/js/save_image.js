window.addEventListener('DOMContentLoaded', () => {
    // load data from DB
    fetch('/view/load', {
        method: 'POST',
    })
        .then((res) => res.json())
        .then((res) => {
            let plan_name = addList(res.data_array);
            saveAsImage(plan_name);
        })
        .catch((err) => {
            console.error('실패:', err);
        });


});

function addList(data_array) {
    $('#plan_name').text(data_array.plan_name);
    $('#plan_location').text("여행할 장소: "+data_array.location);
    $('#plan_date').text("여행 기간: "+data_array.date);
    $('#plan_people').text("인원수: "+data_array.people);

    let data = JSON.parse(data_array.data);
    let plan_data_array = data.plan_data_array;

    let loc_array = plan_data_array[0].loc;
    let st_time_array = plan_data_array[1].st_time;
    let en_time_array = plan_data_array[2].en_time;
    let des_array = plan_data_array[3].description;

    for (i = 1; i <= loc_array.length; i++) {
        let date = '';
        if (st_time_array[i - 1].length < 1 && en_time_array[i - 1].length < 1)
            date = '미정';
        else
            date = `${st_time_array[i - 1]}~${en_time_array[i - 1]}`;

        let description = '';
        if (des_array[i - 1].length > 0)
            description = des_array[i - 1];

        let html = `
            <div id="plan${i}" class="plan-container">
                <div class="plans" style="width: 160px;">${date}</div>
                <div class="plans" style="width: 310px;">${loc_array[i - 1]}</div>
                <div class="plans" style="width: 320px;">${description}</div>
            </div>
            `;
        $("#container").append(html);
    }

    return data_array.plan_name;
}

function saveAsImage(plan_name) {
    // save plan image
    let element = document.getElementById('container');
    let options = {
        scrollY: -window.scrollY,
        backgroundColor: 'white',
        scale: 0.5
    };

    html2canvas(element, options).then(function (canvas) {
        let link = document.createElement('a');
        link.href = canvas.toDataURL();
        link.download = plan_name
        link.click();
        history.go(-1);
    });
}
