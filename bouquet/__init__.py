"""
Rose bouquet - an animated 3D bouquet drawn entirely with ASCII characters.
Run it with `python main.py` from the folder above. One file per part:

    settings.py        what you'd want to change: the note, the window, when each stage
                       happens, where the bouquet sits
    maths.py           small maths helpers
    timeline.py        when the growth reaches a height / the stars reach a spot
    camera.py          where we look from, and how points land on the character grid
    roses.py           where the 19 roses sit, how big, which purple, when they open
    petals.py          one rose's shape - petals and sepals - at every stage of opening
    greenery.py        stems, the foliage dome, leaves, baby's breath
    wrapper.py         the wrapping paper, and how it blows out like a skirt
    bow.py             the ribbon, bow and tails
    falling.py         loose petals tumbling down
    sparks.py          the gold sparks as each rose opens
    stars.py           the twinkling stars, and the shapes stars are drawn with
    drawing_stars.py   the sparkling stars that draw the bouquet as it grows
    looks.py           the colours and the characters
    scene.py           every point that is showing at a given moment
    render.py          points -> characters: depth, light, petal outlines, edge strokes
    overlays.py        stars, sparks and loose petals drawn over the bouquet
    message.py         the note that types itself out
    frame.py           one whole frame, put together
    music.py           the background song, playing on a loop (put it in ../music/)
    window.py          the pygame window, the glow, the status lines, the main loop
"""
