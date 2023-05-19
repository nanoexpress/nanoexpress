# Contributing to nanoexpress

Thank you so much for wanting to contribute to nanoexpress !
Follow these steps to contribute to the project:

- [Submission Guidelines](#submit)
- [Commit Message Format](#commit)

## <a name="submit"></a> Submission Guidelines

### <a name="submit-issue"></a> Submitting an Issue

Before you submit an issue, please search the issue tracker,
maybe an issue for your problem already exists and the discussion might inform you of workarounds readily available.
We want to fix all the issues as soon as possible, but before fixing a bug we need to reproduce and confirm it.
In order to reproduce bugs we ask you to provide a minimal code snippet that shows a reproduction of the problem.

You can file new issues by filling out our [new issue form](https://github.com/nanoexpress/nanoexpress/issues/new/choose).

### <a name="submit-pr"></a> Submitting a Pull Request (PR)

Before you submit your Pull Request (PR) consider the following guidelines:

- Search [GitHub](https://github.com/nanoexpress/nanoexpress/pulls) for an open or closed PR
  that relates to your submission. You don't want to duplicate effort.
- Make your changes in a new git branch:

     ```shell
     git checkout -b my-branch master
     ```

- Create your patch, **including appropriate test cases**. Without tests your PR will not be accepted.

     ```shell
     git commit -a

    Note: the optional commit -a command line option will automatically "add" and "rm" edited files.

- Push your branch to GitHub:

    ```shell
    git push origin -u my-branch
    ```

- In GitHub, send a pull request to `nanoexpress/nanoexpress:master`.
- If we suggest changes then:
  - Make the required updates.
  - Rebase your branch and force push to your GitHub repository (this will update your Pull Request):

    ```shell
    git rebase master -i
    git push -f
    ```

That's it! Thank you for your contribution!

#### After your pull request is merged

After your pull request is merged, you can safely delete your branch and pull the changes
from the main (upstream) repository:

- Delete the remote branch on GitHub either through the GitHub web UI or your local shell as follows:

    ```shell
    git push origin --delete my-branch
    ```

- Check out the master branch:

    ```shell
    git checkout master -f
    ```

- Delete the local branch:

    ```shell
    git branch -D my-branch
    ```

- Update your master with the latest upstream version:

    ```shell
    git pull --ff upstream master
    ```

## <a name="commit"></a> Commit Message Guidelines

We have very precise rules over how our git commit messages can be formatted.  This leads to **more
readable messages** that are easy to follow when looking through the **project history**.  But also,
we use the git commit messages to **generate changelog**.

### Commit Message Format

Each commit message consists of a **header**, a **body** and a **footer**.  The header has a special
format that includes a **type** and a **subject**:

```text
<type>: <subject>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
```

Any line of the commit message cannot be longer 100 characters! This allows the message to be easier
to read on GitHub as well as in various git tools.

### Revert

If the commit reverts a previous commit, it should begin with `revert:`, followed by the header of
the reverted commit. In the body it should say: `This reverts commit <hash>.`, where the hash is
the SHA of the commit being reverted.

### Type

Must be one of the following:

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **perf**: A code change that improves performance
- **test**: Adding missing tests or correcting existing tests
- **build**: Changes that affect the build system, CI configuration or external dependencies
- **chore**: Other changes that don't modify `src` or `test` files

### Subject

The subject contains succinct description of the change:

- use the imperative, present tense: "change" not "changed" nor "changes"
- don't capitalize first letter
- no dot (.) at the end

### Body

Just as in the **subject**, use the imperative, present tense: "change" not "changed" nor "changes".
The body should include the motivation for the change and contrast this with previous behavior.

### Footer

The footer should contain any information about **Breaking Changes** and is also the place to
reference GitHub issues that this commit **Closes**.

**Breaking Changes** should start with the word `BREAKING CHANGE:` with a space or two newlines.
The rest of the commit message is then used for this.

### Examples

Implement new feature:

```text
feat(query): implement support array query params

feat: implement new parser

Closes: #12345
```

Fix and close issue:

```text
fix(route): resolve issues uppercase route names

fix(12345): fix 12345 issue

Closes: #12345
```

Docs update:

```text
docs(contributing): add commits examples

docs: update request type
```

Changes that do not affect the meaning of the code:

```text
style(route): change double quotes to single

style: format via prettier route.js
```

Refactor code:

```text
refactor(route): fixed infinite loop

ref: parse query with an array
```

Performance changes:

```text
perf(route): implement lookup algorithm via stack data structure

perf: implement fast json serialization then performance rose 25%

Note: Indicate changes in performance in as  numbers as possible. Explain the indicators with clear evidence and tests.
  This will help you review the change you made even faster.
```

Adding missing tests or correcting existing tests:

```text
test(benchmark): test lookup routes perfomance

test: test query parser parse array in query
```

Changes that affect the build system, CI configuration or external dependencies:

```text
build(eslint): setup eslint

build: add lint stage to CI step

Closes: #12345
```

Other changes that don't modify `src` or `test` files:

```text
chore(gh-action): fix gh-actions config for future releases

chore: fix linting errors
```
