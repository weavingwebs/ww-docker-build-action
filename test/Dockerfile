FROM busybox

ARG VERSION_TEST_A
ARG VERSION_TEST_B
ENV VERSION_TEST_A ${VERSION_TEST_A}
ENV VERSION_TEST_B ${VERSION_TEST_B}

RUN sh -c '[ "$VERSION_TEST_A" = "A" ] && [ "$VERSION_TEST_B" = "B" ] && echo "success"'
