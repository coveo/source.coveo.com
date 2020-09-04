---
layout: post

title: "Accessibility within the search experience "

tags: [accessibility, search, compliance]

author:
  name: Jamie Lawson
  bio: Solution Architect
  image: Jamie.png
---
Working for a web-based company, you’ve most likely heard the question: “Is your product WCAG compliant.” Having previously worked in sales, the answer for me was always something along the lines of “Yeah, sure, we are WCAG 2.0 compliant.” But, do you know what that actually means? Do you know what WCAG stands for? *hint Web Content Accessibility Guidelines

<!-- more -->

## WCAG 101

I hated answering that question because I didn't fully understand it, so I took it upon myself to do a little research. I realized that, at a basic level, I had never sat down and thought about the actual experience a person with a visual impairment had while navigating the internet.

This led me to numerous blog posts and YouTube videos on how screen readers work and how different people interact with the internet in ways I hadn’t considered. 

For users who are blind, keyboard navigation is usually required. A screen reader works in a linear pattern; it starts from the top of the HTML page and navigates the headers of the page. The computer then speaks the words of the highlighted section.

I realized that this is an area where search is vital. If this user has to navigate through hundreds of pages buried within menus using a screen reader, they just won’t end up finding the content they want. Imagine the efficiency if a user didn't need to navigate through all the links on a homepage to find the content they’re looking for, but was able to find it within a single search. 

This is where Coveo can really make a difference: by being able to provide a machine learning powered search experience for them. Based on the screen reader technology, it also makes sense then that a majority of these users prefer using their phones to navigate websites, as the mobile experience usually reduces the clutter.

A very interesting experiment on using screen readers can be found in this [article](https://www.smashingmagazine.com/2018/12/voiceover-screen-reader-web-apps/). This article resonated with me, as the author looked at accessibility from the user’s experience. After taking time to familiarize myself with this knowledge I wanted to apply it to website search.

## Search and Accessibility

I am not going to dive into every aspect of Web Accessibility, but it is important to understand WHERE Coveo is compliant. 
> Just as a general statement, Coveo’s most recent compliance audit (April 27, 2020) has found that the JavaScript Search Framework is WCAG 2.1 A & AA compliant.

A user likely interacts with the Coveo JavaScript Search Framework for the front end search experience. For this reason, Coveo has taken steps to ensure that the framework is up to WCAG standards. Specifically, Coveo is compliant with (to just name a few):

- keyboard functionality
- font colors and sizes
- focus order
- correct page titles
- language automation 
- page parsing

## ARIA Landmarks, Alt Text, and Color

ARIA landmarks are attributes you can add to elements in your page to define areas like the main content or a navigation region. Coveo has implemented ARIA Landmarks to help accessibility tools navigate through its components.These ARIA Landmarks are designed to identify and describe elements of a page.

Below is a breakdown of the ARIA Landmarks found on the JavaScript Search Framework.

![ARIA landmarks on Coveo JSUI]({{ site.baseurl }}/images/2020-08-25 Coveo-and-WCAG/jsui-accessibility-landmarks.png)

When applying ARIA Landmarks, the developer must include a Role and a Label.

The Role is designed to identify WHAT the section is intended for, e.g., navigation, region of a page, search, etc. The Label is to describe what the section is, e.g., breadcrumbs, tabs, page selector, etc. 

Now, this is the basic premise of what these landmarks are for, but let’s look at them in the wild to get a better understanding of how they are used.

![Example of ARIA role]({{ site.baseurl }}/images/2020-08-25 Coveo-and-WCAG/ARIA-roles.png)

As you can see in the highlighted area, we have the magnifying glass button selected. The ARIA role here is ‘Button’ and the label is ‘Search’. This allows the user to understand that ‘if I select this button I will initiate a search’.

That being said, once any additional development work is conducted, this is where the developer must follow [guidelines](https://www.w3.org/WAI/WCAG21/quickref/) to maintain this compliance.

One area that is typically overlooked is the use of alt text (alternate text). Alt text is an area within the HTML that is used to describe an image. Remember that a screen reader is only able to read back text to the individual. If the alt tag is missing or not descriptive, the user won’t be able to understand the image.

![Example of Alt text]({{ site.baseurl }}/images/2020-08-25 Coveo-and-WCAG/Alt-text.png)

As with ARIA Landmarks and alt text, another area that is important to address is color contrast. As front end developers are attempting to brand their websites, they need to take into account that not all color combinations are adhering to accessibility guidelines. A useful tool for checking compliance with contrasts can be found [on this website](https://snook.ca/technical/colour_contrast/colour.html#fg=01A982,bg=FFFFFF).

## Conclusion

The bottom line is that, yes, WCAG is important. It is important to understand the reason for the WCAG, because these users are depending on them to have a quality experience.

Right now it’s normal for developers to check and double-check their code for security vulnerabilities. Why shouldn’t we check and double-check for accessibility features as well? 

Underneath all of the guidelines and rules, we are trying to provide an equal experience for everyone to find information. Coveo can make a major impact by circumventing the tedious navigation experience and instead provide the documentation with a search. In this day and age, inclusion should be one of our top priorities, and without an understanding of accessibility, we are providing a lesser customer experience.

## References
- [www.w3.org](https://www.w3.org/WAI/WCAG21/quickref/?showtechniques=111#principle1)
- [uxdesign.cc](https://uxdesign.cc/how-visually-impaired-people-navigate-the-web-7f9eab9d9c37)
- [gizmodo.com](https://gizmodo.com/giz-explains-how-blind-people-see-the-internet-5620079)
- [getadaaccessible.com](https://getadaaccessible.com/ada-website/)
- [www.a11ymatters.com](https://www.a11ymatters.com/pattern/accessible-search/)
- [docs.coveo.com](https://docs.coveo.com/en/2666/javascript-search-framework/adding-ARIA-landmarks)
