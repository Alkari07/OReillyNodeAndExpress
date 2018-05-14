suite ('"About" Page tests', function() {
    test('page should contain link to contact page', function() {
        //check that thereis at least one link to /contact on the page
        assert($('a[href="/contact"]').length)
    })
});