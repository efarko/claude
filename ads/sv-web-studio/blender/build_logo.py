"""Reconstruye el logo de SV WebStudio en 3D y lo renderiza.

El sitio no publica un logo descargable: el logo es un cuadro redondeado con
degradado navy -> azul (`--brand-gradient-logo`) y "SV" en blanco con
Bricolage Grotesque Bold. Este script lo replica con geometría + texto.

Uso (Blender como módulo, `pip install bpy==4.2.*`):
    python build_logo.py                 # .blend + imagen fija + secuencia PNG (Eevee)
    python build_logo.py --still         # solo .blend + imagen fija
    python build_logo.py --cycles        # Cycles en vez de Eevee (más realista, ~4x más lento en CPU)

Eevee necesita OpenGL/EGL. En un contenedor sin GPU: `apt-get install libegl1 libgl1-mesa-dri`
(Mesa renderiza por software: ~6,6 s/fotograma a 1000x1000 frente a ~25 s con Cycles en 4 núcleos).
"""
import math
import os
import sys

import bpy  # noqa: I001 — bpy debe cargarse antes que bmesh/mathutils
import bmesh
from mathutils import Vector

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
FONT = os.path.join(ROOT, "brand", "fonts", "BricolageGrotesque-Bold.ttf")
OUT_BLEND = os.path.join(HERE, "sv_logo_3d.blend")
OUT_STILL = os.path.join(ROOT, "renders", "logo_still.png")
OUT_SEQ = os.path.join(ROOT, "renders", "logo_anim", "frame_")

FPS = 30
FRAMES = 105  # 3,5 s
RES = 1000
USE_CYCLES = "--cycles" in sys.argv

# Colores de css/style.css
NAVY = "#0e142a"
BLUE_DARK = "#1c5cc6"
BLUE = "#2d87ff"
WHITE = "#ffffff"


def srgb_to_linear(hex_color):
    h = hex_color.lstrip("#")
    out = []
    for i in (0, 2, 4):
        c = int(h[i:i + 2], 16) / 255
        out.append(c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4)
    return (*out, 1.0)


def reset_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    if USE_CYCLES:
        scene.render.engine = "CYCLES"
        scene.cycles.device = "CPU"
        scene.cycles.samples = 48
        scene.cycles.use_denoising = True
    else:
        scene.render.engine = "BLENDER_EEVEE_NEXT"
        scene.eevee.taa_render_samples = 16
    scene.render.resolution_x = RES
    scene.render.resolution_y = RES
    scene.render.film_transparent = True
    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_mode = "RGBA"
    scene.render.fps = FPS
    scene.frame_start = 1
    scene.frame_end = FRAMES
    # "Standard" para que los hex de la marca salgan sin el tone mapping de AgX.
    scene.view_settings.view_transform = "Standard"
    scene.view_settings.look = "None"
    return scene


def tile_mesh(size=2.0, radius_ratio=0.30, depth=0.36):
    """Cuadro con esquinas redondeadas (radio 9px/30px como en la web), extruido."""
    bm = bmesh.new()
    h = size / 2
    verts = [bm.verts.new((x, y, 0)) for x, y in ((-h, -h), (h, -h), (h, h), (-h, h))]
    face = bm.faces.new(verts)
    bmesh.ops.bevel(bm, geom=verts, offset=size * radius_ratio, segments=24,
                    affect="VERTICES", profile=0.5)
    bm.faces.ensure_lookup_table()
    face = bm.faces[0]
    ext = bmesh.ops.extrude_face_region(bm, geom=[face])
    moved = [e for e in ext["geom"] if isinstance(e, bmesh.types.BMVert)]
    bmesh.ops.translate(bm, verts=moved, vec=(0, 0, depth))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    me = bpy.data.meshes.new("SV_Tile")
    bm.to_mesh(me)
    bm.free()
    obj = bpy.data.objects.new("SV_Tile", me)
    bpy.context.collection.objects.link(obj)
    bev = obj.modifiers.new("Bisel", "BEVEL")
    bev.width = 0.07
    bev.segments = 6
    bev.limit_method = "ANGLE"
    bev.angle_limit = math.radians(60)
    bev.harden_normals = True
    obj.data.shade_smooth()
    # Cara frontal mirando a la cámara (-Y)
    obj.rotation_euler = (math.radians(90), 0, 0)
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    bpy.ops.object.transform_apply(rotation=True)
    obj.select_set(False)
    # Centrar en profundidad
    for v in obj.data.vertices:
        v.co.y += depth / 2
    return obj, size, depth


def gradient_material():
    """--brand-gradient-logo: linear-gradient(118deg, #0e142a 8%, #1c5cc6 52%, #2d87ff 92%)."""
    mat = bpy.data.materials.new("SV_Gradiente")
    mat.use_nodes = True
    nt = mat.node_tree
    nodes, links = nt.nodes, nt.links
    bsdf = nodes["Principled BSDF"]
    bsdf.inputs["Roughness"].default_value = 0.32
    bsdf.inputs["Coat Weight"].default_value = 1.0
    bsdf.inputs["Coat Roughness"].default_value = 0.06

    coord = nodes.new("ShaderNodeTexCoord")
    # Ángulo CSS 118deg -> dirección (sin, cos) con y hacia arriba.
    # En el plano frontal: x = X del objeto, "arriba" = Z del objeto.
    ang = math.radians(118)
    direction = Vector((math.sin(ang), 0, math.cos(ang)))
    dot = nodes.new("ShaderNodeVectorMath")
    dot.operation = "DOT_PRODUCT"
    dot.inputs[1].default_value = direction
    links.new(coord.outputs["Object"], dot.inputs[0])

    # Largo del degradado CSS para un cuadro de lado 2: |sin|+|cos| (semi-largo)
    half = abs(math.sin(ang)) + abs(math.cos(ang))
    rng = nodes.new("ShaderNodeMapRange")
    rng.inputs["From Min"].default_value = -half
    rng.inputs["From Max"].default_value = half
    links.new(dot.outputs["Value"], rng.inputs["Value"])

    ramp = nodes.new("ShaderNodeValToRGB")
    els = ramp.color_ramp.elements
    els[0].position, els[0].color = 0.08, srgb_to_linear(NAVY)
    els[1].position, els[1].color = 0.92, srgb_to_linear(BLUE)
    mid = els.new(0.52)
    mid.color = srgb_to_linear(BLUE_DARK)
    links.new(rng.outputs["Result"], ramp.inputs["Fac"])
    links.new(ramp.outputs["Color"], bsdf.inputs["Base Color"])
    return mat


def white_material():
    mat = bpy.data.materials.new("SV_Blanco")
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = srgb_to_linear(WHITE)
    bsdf.inputs["Roughness"].default_value = 0.18
    bsdf.inputs["Coat Weight"].default_value = 0.6
    bsdf.inputs["Coat Roughness"].default_value = 0.05
    return mat


def letters(tile_depth):
    font = bpy.data.fonts.load(FONT)
    cu = bpy.data.curves.new("SV_Texto", "FONT")
    cu.body = "SV"
    cu.font = font
    cu.align_x = "CENTER"
    cu.align_y = "CENTER"
    cu.size = 1.2
    cu.extrude = 0.07
    cu.bevel_depth = 0.014
    cu.bevel_resolution = 4
    cu.space_character = 0.98
    obj = bpy.data.objects.new("SV_Texto", cu)
    bpy.context.collection.objects.link(obj)
    obj.rotation_euler = (math.radians(90), 0, 0)
    # Posición final: sobresale de la cara frontal (y = -depth/2)
    obj.location = (0, -tile_depth / 2 - 0.07, 0)
    return obj


def lights_and_camera():
    world = bpy.data.worlds.new("Estudio")
    bpy.context.scene.world = world
    world.use_nodes = True
    bg = world.node_tree.nodes["Background"]
    bg.inputs["Color"].default_value = srgb_to_linear("#1a2440")
    bg.inputs["Strength"].default_value = 0.2

    def area(name, loc, rot, energy, size, color="#ffffff", shape="RECTANGLE", size_y=None):
        data = bpy.data.lights.new(name, "AREA")
        data.energy = energy
        data.shape = shape
        data.size = size
        if size_y is not None:
            data.size_y = size_y
        data.color = srgb_to_linear(color)[:3]
        obj = bpy.data.objects.new(name, data)
        bpy.context.collection.objects.link(obj)
        obj.location = loc
        obj.rotation_euler = [math.radians(a) for a in rot]
        return obj

    area("Key", (4.0, -5.0, 3.0), (62, 0, 38), 110, 3.0)
    area("Fill", (-4.5, -4.5, -1.5), (100, 0, -45), 25, 4.0, color="#bcd9ff")
    area("Rim", (0.5, 4.0, 3.5), (-50, 0, 180), 300, 3.0, color="#5aa3ff")
    # Barra larga para el destello que cruza el logo en la animación
    glint = area("Glint", (-6, -4.0, 0), (90, 0, 0), 260, 0.35, shape="RECTANGLE", size_y=6.0)

    cam_data = bpy.data.cameras.new("Camara")
    cam_data.lens = 95
    cam = bpy.data.objects.new("Camara", cam_data)
    bpy.context.collection.objects.link(cam)
    cam.location = (0, -10.5, 0.35)
    cam.rotation_euler = (math.radians(88), 0, 0)
    bpy.context.scene.camera = cam
    return glint


def key(obj, path, frame, value, interp="BEZIER"):
    setattr(obj, path, value)
    obj.keyframe_insert(data_path=path, frame=frame)
    for fc in obj.animation_data.action.fcurves:
        if fc.data_path == path:
            for kp in fc.keyframe_points:
                if kp.co.x == frame:
                    kp.interpolation = interp
                    kp.easing = "EASE_OUT"


def animate(rig, text, glint, tile_depth):
    # Revelado: entra girando, rebota y queda; las letras salen hacia adelante.
    key(rig, "rotation_euler", 1, (0, 0, math.radians(-220)), "EXPO")
    key(rig, "rotation_euler", 34, (0, 0, math.radians(8)))
    key(rig, "rotation_euler", 48, (0, 0, 0))
    key(rig, "rotation_euler", 78, (math.radians(-4), 0, math.radians(-10)))
    key(rig, "rotation_euler", FRAMES, (0, 0, math.radians(6)))

    key(rig, "scale", 1, (0.05, 0.05, 0.05), "BACK")
    key(rig, "scale", 30, (1.0, 1.0, 1.0))

    hidden = (0, -tile_depth / 2 + 0.25, 0)  # metidas dentro del cuadro
    final = tuple(text.location)
    key(text, "location", 1, hidden)
    key(text, "location", 34, hidden, "BACK")
    key(text, "location", 50, final)

    key(glint, "location", 1, (-6, -4.0, 0))
    key(glint, "location", 52, (-6, -4.0, 0), "SINE")
    key(glint, "location", 80, (6, -4.0, 0))


def main():
    still_only = "--still" in sys.argv
    scene = reset_scene()

    rig = bpy.data.objects.new("SV_Logo", None)
    bpy.context.collection.objects.link(rig)

    tile, _, depth = tile_mesh()
    tile.data.materials.append(gradient_material())
    tile.parent = rig

    text = letters(depth)
    text.data.materials.append(white_material())
    text.parent = rig

    glint = lights_and_camera()
    text_final = tuple(text.location)
    animate(rig, text, glint, depth)

    os.makedirs(os.path.dirname(OUT_STILL), exist_ok=True)
    bpy.ops.wm.save_as_mainfile(filepath=OUT_BLEND)

    # (a) Imagen fija: pose de reposo con un leve giro para que se lea el volumen
    rig.animation_data_clear()
    text.animation_data_clear()
    glint.animation_data_clear()
    rig.scale = (1, 1, 1)
    text.location = text_final
    rig.rotation_euler = (math.radians(-6), 0, math.radians(-16))
    glint.location = (2.6, -4.0, 0)
    if USE_CYCLES:
        scene.cycles.samples = 128
    else:
        scene.eevee.taa_render_samples = 64
    scene.render.filepath = OUT_STILL
    bpy.ops.render.render(write_still=True)
    print("still ->", OUT_STILL)
    if still_only:
        return

    # (b) Secuencia PNG con transparencia, desde el .blend animado
    bpy.ops.wm.open_mainfile(filepath=OUT_BLEND)
    scene = bpy.context.scene
    os.makedirs(os.path.dirname(OUT_SEQ), exist_ok=True)
    scene.render.filepath = OUT_SEQ
    bpy.ops.render.render(animation=True)
    print("seq ->", OUT_SEQ)


if __name__ == "__main__":
    main()
