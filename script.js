// --GLOBAL --

const MAX_CHAR = 150;
const BASE_API_URL = "https://bytegrad.com/course-assets/js/1/api"


const textareaEl = document.querySelector('.form__textarea');
const counterEl = document.querySelector('.counter');
const formElement = document.querySelector('.form');
const feedbackListElement = document.querySelector('.feedbacks');
const submitBtnElement = document.querySelector('.submit-btn');
const spinnerElement = document.querySelector('.spinner');
const hashtagListElement = document.querySelector('.hashtags');

const renderFeedbackItem = (feedbackItem) => {

        const feedBackItemHTML = `<li class="feedback">
        <button class="upvote">
            <i class="fa-solid fa-caret-up upvote__icon"></i>
            <span class="upvote__count">${feedbackItem?.upvoteCount}</span>
        </button>

        <section class="feedback__badge">
            <p class="feedback__letter">${feedbackItem?.badgeLetter}</p>
        </section>

        <div class="feedback__content">
            <p class="feedback__company">${feedbackItem?.company}</p>
            <p class="feedback__text">${feedbackItem?.text}</p>
        </div>
        <p class="feedback__date">${feedbackItem?.daysAgo === 0 ? "New" : `${feedbackItem?.daysAgo}d`  }</p>
    </li>`;

    feedbackListElement.insertAdjacentHTML("beforeend", feedBackItemHTML);

}

// -- COUNTER COMPONENT --
const inputHandler = () => {
    
    let textAreaTrimmed = textareaEl.value.trim();

    if(textAreaTrimmed.includes("<script>")) {
        window.alert("You can't use <script> in your text!");
        textAreaTrimmed = textAreaTrimmed.replace("<script>", "");
        textareaEl.value = textAreaTrimmed;
    }

    // determine maximum number of characters
    const maxNrChars = MAX_CHAR;

    // determine number of characters currently typed
    const nrCharsTyped = textAreaTrimmed.length;

    // calculate number of characters left (maximum minus currently typed)
    const charsLeft = maxNrChars - nrCharsTyped;

    // show number of characters left
    counterEl.textContent = charsLeft;
};

const showVisualIndicator = (textCheck) => {
    const className = textCheck === 'valid' ? "form-valid" : "form--invalid";
    // show valid indicator
    formElement.classList.add(className);
    setTimeout(() => {
        // remove valid indicator
        formElement.classList.remove(className);
    }, 2000);
}

textareaEl.addEventListener('input', inputHandler);

// submit component

const submitHandler = (event) => {
    event.preventDefault();
    const textValue = textareaEl.value.trim();

    // validate text (e.g check if #hashtag is present and text is long enough)
    if(textValue.includes("#") && textValue.length >= 5){
        // show valid indicator
        showVisualIndicator("valid");
    } else {
        // show invalid indicator
        showVisualIndicator("invalid");

        textareaEl.focus();

        return;
    }

    const hashtag = textValue.split(" ").find((hashedWord) => hashedWord.includes("#"));
  
    const company = hashtag.substring(1);
    const badgeLetter = company.substring(0, 1).toUpperCase();
    const upvoteCount = 0;
    const daysAgo = 0;

    // new html feedback item

        const feedbackItem = {
            hashtag,
            company,
            badgeLetter,
            upvoteCount,
            daysAgo,
        }

        renderFeedbackItem(feedbackItem);

        fetch(`${BASE_API_URL}/feedbacks`, {
            method: "POST",
            body: JSON.stringify(feedbackItem),
            headers: {
                Accept: "application/json",
                'Content-Type': 'application/json'
            }
        })
        .then((response) => {
            if(!response.ok) {
                console.log("Something went wrong!");
                return;
            }
        })
        .catch((error) => console.log(error));

        // clear textarea
        textareaEl.value = '';

        // blur submit button
        submitBtnElement.blur();

        // reset counter
        counterEl.textContent = MAX_CHAR;


}


    // Feedback list component
    const clickHandler = (event) => {
        // get clicked html element
        const clikedElement = event.target;

        const upvoteIntention = clikedElement.className.includes("upvote");

        // run the appropriate logic
        if(upvoteIntention) {
            // get the closest upvote button
            const upvoteBtnElement = clikedElement.closest(".upvote");

            // disable upvote button to prevent double click
            upvoteBtnElement.disabled = true;

            // select the upvote count element within the upvote button
            const upvoteCountElement = upvoteBtnElement.querySelector(".upvote__count");

            // get currently displayed upvote count as number
            let upvoteCount = +upvoteCountElement.textContent;

            // increment upvotecount by 1
            upvoteCount += 1;

            // set upvote count
            upvoteCountElement.textContent = upvoteCount;

        } else {
            // expand the clicked feedack item
            clikedElement.closest(".feedback").classList.toggle("feedback--expand");
        }
    }

    const hashTagClickHandler = (event) => {
        const clickedElement = event.target;

        // stop function if click happens in list, but outside buttons
        if(clickedElement.className === 'hashtags') return;

        // Extract company name from hashtag
       const companyNameFromHashTag = clickedElement.textContent.substring(1).trim().toLowerCase();
    
       feedbackListElement.childNodes.forEach((childNode) => {
        // stop this iteration id it is a text node
        if(childNode.nodeType === 3) return;

        // extract company name from node item
        const companyNameFromFeedbackItem = childNode.querySelector(".feedback__company").textContent.toLowerCase().trim();
        
        if(companyNameFromHashTag !== companyNameFromFeedbackItem) {
            childNode.remove();
        }
    });
    }


    fetch(`${BASE_API_URL}/feedbacks`)
    .then((response) => response.json())
    .then(({ feedbacks }) => {

        spinnerElement.remove();

        feedbacks?.forEach((feedbackItem) => renderFeedbackItem(feedbackItem));

    })
    .catch((error) => {
        textareaEl.textContent = `Failed to fetch feedback item. Error message: ${error?.message}`;
    });



formElement.addEventListener("submit", submitHandler);
feedbackListElement.addEventListener("click", clickHandler);
hashtagListElement.addEventListener("click", hashTagClickHandler);