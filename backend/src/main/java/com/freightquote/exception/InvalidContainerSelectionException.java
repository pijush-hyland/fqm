package com.freightquote.exception;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class InvalidContainerSelectionException extends RuntimeException {

    private final List<Long> containerIds;

    public InvalidContainerSelectionException(List<Long> containerIds) {
        super("Invalid FCL Container Option selection: " + containerIds);
        this.containerIds = Collections.unmodifiableList(new ArrayList<>(containerIds));
    }

    public List<Long> getContainerIds() {
        return containerIds;
    }
}