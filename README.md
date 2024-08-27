# OWWSM

![](/doc_assets/concept.png)

## License and Usage

Please note that while this repository is public, it does not include an
open-source license, meaning all rights are reserved by the author.

According to GitHub’s Terms of Service, by default, other users have the right
to view and fork a public repository. However, this does not grant them the
right to use, modify, or distribute the code or content without explicit
permission.

## Framwork

higher-order operations, allowing developers to not only work directly with the
core components but also extend, modify, or dynamically generate these
components in ways that might not be possible with the base technologies alone

## Considerations

### outer layer = arrow funtions

Use Arrow Functions for methods that need to consistently refer to the this
context of the surrounding scope. For example, if you want to ensure that this
always refers to the object returned by Conditions, arrow functions can be
advantageous.
