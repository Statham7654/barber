"""
BLACK JACK BARBERS — студия изображений (Blender 4.2 / bpy).
Процедурные модели инструментов барбера, PBR-материалы, кинематографичный свет, кадры для сайта и GLB бритвы.

  python3 studio/studio.py <shot> [samples]      — рендер кадра в studio/out/<shot>.png
  python3 studio/studio.py glb                   — экспорт бритвы в studio/out/razor.glb
"""
import bpy, bmesh, math, sys, os, random
from mathutils import Vector, Matrix, Euler

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'out'); os.makedirs(OUT, exist_ok=True)
ARGS = [a for a in sys.argv[1:] if not a.endswith('.py')]
SHOT = ARGS[0] if ARGS else 'hero'
SAMPLES = int(ARGS[1]) if len(ARGS) > 1 else 96
TAU = math.tau

# ───────────────────────── базовые утилиты
def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)

def link(ob):
    bpy.context.collection.objects.link(ob); return ob

def mesh_from_bm(name, bm):
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    return link(bpy.data.objects.new(name, me))

def smooth(ob, angle=40):
    for p in ob.data.polygons: p.use_smooth = True
    m = ob.modifiers.new('ws', 'WEIGHTED_NORMAL'); m.keep_sharp = True
    try:
        bpy.context.view_layer.objects.active = ob
        bpy.ops.object.select_all(action='DESELECT'); ob.select_set(True)
        bpy.ops.object.shade_smooth_by_angle(angle=math.radians(angle))
    except Exception:
        pass

def bevel(ob, w=0.05, seg=3, angle=40):
    m = ob.modifiers.new('bev', 'BEVEL'); m.width = w; m.segments = seg; m.limit_method = 'ANGLE'; m.angle_limit = math.radians(angle)
    m.harden_normals = False
    return m

def extrude(name, pts, depth, center=True):
    """Плоский многоугольник (XY) → тело толщиной depth по Z"""
    bm = bmesh.new()
    vs = [bm.verts.new((x, y, 0)) for x, y in pts]
    f = bm.faces.new(vs)
    bmesh.ops.recalc_face_normals(bm, faces=[f])
    if f.normal.z < 0: f.normal_flip()
    r = bmesh.ops.extrude_face_region(bm, geom=[f])
    top = [e for e in r['geom'] if isinstance(e, bmesh.types.BMVert)]
    bmesh.ops.translate(bm, verts=top, vec=(0, 0, depth))
    if center: bmesh.ops.translate(bm, verts=bm.verts, vec=(0, 0, -depth / 2))
    caps = [f for f in bm.faces if len(f.verts) > 4]
    bmesh.ops.triangulate(bm, faces=caps, quad_method='BEAUTY', ngon_method='EAR_CLIP')
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return mesh_from_bm(name, bm)

def lathe(name, prof, steps=96):
    bm = bmesh.new()
    vs = [bm.verts.new((r, 0, z)) for r, z in prof]
    for a, b in zip(vs, vs[1:]): bm.edges.new((a, b))
    bmesh.ops.spin(bm, geom=list(bm.verts) + list(bm.edges), cent=(0, 0, 0), axis=(0, 0, 1), dvec=(0, 0, 0), angle=TAU, steps=steps, use_merge=True)
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-5)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    ob = mesh_from_bm(name, bm)
    for p in ob.data.polygons: p.use_smooth = True
    return ob

def catmull(pts, n=8):
    import numpy as np
    P = [np.array(p, float) for p in pts]; P = [2 * P[0] - P[1]] + P + [2 * P[-1] - P[-2]]
    out = []
    for i in range(1, len(P) - 2):
        p0, p1, p2, p3 = P[i - 1:i + 3]
        for t in [k / n for k in range(n)]:
            t2, t3 = t * t, t * t * t
            out.append(0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3))
    out.append(P[-2]); return [tuple(p) for p in out]

def apply_all(ob):
    bpy.context.view_layer.objects.active = ob
    bpy.ops.object.select_all(action='DESELECT'); ob.select_set(True)
    for m in list(ob.modifiers):
        try: bpy.ops.object.modifier_apply(modifier=m.name)
        except Exception: pass

def join(obs, name):
    bpy.ops.object.select_all(action='DESELECT')
    for o in obs: o.select_set(True)
    bpy.context.view_layer.objects.active = obs[0]; bpy.ops.object.join()
    ob = bpy.context.view_layer.objects.active; ob.name = name; return ob

def group(name, obs):
    e = link(bpy.data.objects.new(name, None))
    for o in obs: o.parent = e
    return e

# ───────────────────────── материалы
def pbsdf(name, **kw):
    m = bpy.data.materials.new(name); m.use_nodes = True
    b = m.node_tree.nodes['Principled BSDF']
    names = {'color': 'Base Color', 'metal': 'Metallic', 'rough': 'Roughness', 'coat': 'Coat Weight', 'coat_rough': 'Coat Roughness',
             'aniso': 'Anisotropic', 'trans': 'Transmission Weight', 'ior': 'IOR', 'spec': 'Specular IOR Level', 'sheen': 'Sheen Weight', 'alpha': 'Alpha'}
    for k, v in kw.items():
        if k == 'color': v = (*v, 1)
        b.inputs[names[k]].default_value = v
    return m, b

def noise_rough(m, b, lo, hi, scale=40, detail=6):
    nt = m.node_tree
    n = nt.nodes.new('ShaderNodeTexNoise'); n.inputs['Scale'].default_value = scale; n.inputs['Detail'].default_value = detail
    mr = nt.nodes.new('ShaderNodeMapRange'); mr.inputs['To Min'].default_value = lo; mr.inputs['To Max'].default_value = hi
    nt.links.new(n.outputs['Fac'], mr.inputs['Value']); nt.links.new(mr.outputs['Result'], b.inputs['Roughness'])
    return n

def bump(m, b, strength=0.1, scale=200, stretch=None):
    nt = m.node_tree
    tc = nt.nodes.new('ShaderNodeTexCoord'); mp = nt.nodes.new('ShaderNodeMapping')
    if stretch: mp.inputs['Scale'].default_value = stretch
    nt.links.new(tc.outputs['Object'], mp.inputs['Vector'])
    n = nt.nodes.new('ShaderNodeTexNoise'); n.inputs['Scale'].default_value = scale; n.inputs['Detail'].default_value = 8
    nt.links.new(mp.outputs['Vector'], n.inputs['Vector'])
    bp = nt.nodes.new('ShaderNodeBump'); bp.inputs['Strength'].default_value = strength
    nt.links.new(n.outputs['Fac'], bp.inputs['Height']); nt.links.new(bp.outputs['Normal'], b.inputs['Normal'])

def materials():
    M = {}
    M['steel'], b = pbsdf('Steel', color=(0.82, 0.82, 0.8), metal=1, rough=0.14, aniso=0.6)
    bump(M['steel'], b, 0.03, 600, (1, 60, 1))
    M['mirror'], _ = pbsdf('MirrorSteel', color=(0.9, 0.9, 0.88), metal=1, rough=0.06)
    M['gold'], b = pbsdf('Brass', color=(0.72, 0.58, 0.38), metal=1, rough=0.26, aniso=0.4)
    M['ebony'], b = pbsdf('Ebony', color=(0.012, 0.011, 0.01), rough=0.3, coat=1, coat_rough=0.08)
    bump(M['ebony'], b, 0.04, 30, (1, 12, 1))
    M['matte'], b = pbsdf('MatteBlack', color=(0.02, 0.02, 0.02), rough=0.55, spec=0.4)
    noise_rough(M['matte'], b, 0.45, 0.65, 60)
    M['acetate'], b = pbsdf('Acetate', color=(0.03, 0.028, 0.026), rough=0.18, coat=0.6, coat_rough=0.1)
    M['cream'], b = pbsdf('Cream', color=(0.86, 0.83, 0.77), rough=0.35, coat=0.5, coat_rough=0.2)
    M['glass'], b = pbsdf('SmokedGlass', color=(0.42, 0.34, 0.25), rough=0.04, trans=1, ior=1.47)
    M['liquid'], b = pbsdf('Oil', color=(0.55, 0.32, 0.1), rough=0.02, trans=1, ior=1.4)
    # барсучий ворс: светлые кончики, тёмная середина (градиент по высоте) + тонкий шум вдоль волокон
    m, b = pbsdf('Bristle', rough=0.62, sheen=0.4); nt = m.node_tree
    tc = nt.nodes.new('ShaderNodeTexCoord'); sep = nt.nodes.new('ShaderNodeSeparateXYZ'); nt.links.new(tc.outputs['Object'], sep.inputs['Vector'])
    ramp = nt.nodes.new('ShaderNodeValToRGB'); nt.links.new(sep.outputs['Z'], ramp.inputs['Fac'])
    ramp.color_ramp.elements[0].position = 0.1; ramp.color_ramp.elements[0].color = (0.05, 0.045, 0.04, 1)
    ramp.color_ramp.elements[1].position = 0.9; ramp.color_ramp.elements[1].color = (0.82, 0.78, 0.7, 1)
    e = ramp.color_ramp.elements.new(0.55); e.color = (0.18, 0.16, 0.14, 1)
    mr = nt.nodes.new('ShaderNodeMapRange'); mr.inputs['From Min'].default_value = 3.8; mr.inputs['From Max'].default_value = 8.4
    nt.links.new(sep.outputs['Z'], mr.inputs['Value']); nt.links.new(mr.outputs['Result'], ramp.inputs['Fac'])
    nt.links.new(ramp.outputs['Color'], b.inputs['Base Color'])
    bump(m, b, 0.9, 60, (9, 9, 0.35)); M['bristle'] = m
    # сланец: почти чёрный камень с пятнами шероховатости
    m, b = pbsdf('Slate', color=(0.007, 0.007, 0.0075), rough=0.55, spec=0.3)
    noise_rough(m, b, 0.3, 0.8, 2, 8); bump(m, b, 0.05, 30); M['slate'] = m
    return M

# ───────────────────────── модели
def razor(M, open_deg=160):
    """Опасная бритва: полотно с полым сводом (лезвие сходит на нет), хвостовик, шпилька, две накладки из эбена с латунными штифтами."""
    L, H = 7.8, 2.1
    top = catmull([(0, H), (2, H + 0.02), (5, H), (L - 0.4, H - 0.05), (L, H - 0.45)], 6)
    tip = catmull([(L, H - 0.45), (L + 0.12, H - 1.1), (L - 0.15, 0.25), (L - 0.7, 0.0)], 6)[1:]
    edge = [(L - 1.0, 0.0), (0.6, 0.02)]
    tang = [(0.2, 0.22), (-0.2, 0.55), (-0.6, 0.62), (-1.6, 0.9), (-2.4, 1.05), (-2.9, 1.25), (-3.0, 1.55), (-2.8, 1.85), (-2.2, 1.95), (-0.9, 1.98), (-0.2, 2.02)]
    pts = top[::-1][:-1] + [(0, H)] if False else None
    poly = [(0, H)] + top[1:] + tip + edge + tang
    blade = extrude('Blade', poly, 0.34)
    # полый свод: толщина уменьшается к режущей кромке
    for v in blade.data.vertices:
        y = max(0.0, min(1.0, v.co.y / H))
    bevel(blade, 0.03, 3, 50); blade.data.materials.append(M['steel'])
    # шпилька-ось
    pin = lathe('Pivot', [(0, -0.35), (0.18, -0.35), (0.2, -0.3), (0.2, 0.3), (0.18, 0.35), (0, 0.35)], 32)
    pin.rotation_euler.x = 0; pin.location = (-2.35, 1.5, 0); pin.data.materials.append(M['gold'])
    # накладки рукояти
    hl = 12.4
    hprof = catmull([(0, -0.4), (1.5, -1.02), (5, -1.1), (9, -1.05), (11.6, -0.8), (hl, 0), (11.6, 0.8), (9, 1.05), (5, 1.1), (1.5, 1.02), (0, 0.4)], 5)
    hprof = hprof + catmull([(0, 0.4), (-0.45, 0), (0, -0.4)], 4)[1:-1]
    scales = []
    for side in (-1, 1):
        s = extrude('Scale', hprof, 0.22); bevel(s, 0.07, 4, 30); smooth(s, 30)
        s.location.z = side * 0.3; s.data.materials.append(M['ebony']); scales.append(s)
        for px in (0.0, hl - 1.0):
            st = lathe('Stud', [(0, -0.02), (0.13, -0.02), (0.15, 0.02), (0.1, 0.06), (0, 0.065)], 24)
            st.location = (px, 0, side * 0.41); st.rotation_euler.x = 0 if side > 0 else math.pi; st.data.materials.append(M['gold']); scales.append(st)
    wedge = extrude('Wedge', [(hl - 1.6, -0.5), (hl - 0.2, -0.3), (hl - 0.2, 0.3), (hl - 1.6, 0.5)], 0.38); wedge.data.materials.append(M['ebony']); scales.append(wedge)
    handle = group('Handle', scales)
    handle.location = (-2.35, 1.5, 0)
    handle.rotation_euler.z = math.radians(180 - open_deg + 180)
    root = group('Razor', [blade, pin, handle])
    return root

def scissors(M, open_deg=14):
    parts = []
    for side in (-1, 1):
        # полотно: длинное сужающееся, заточка по одной стороне
        bl = extrude('ScBlade', [(0, -0.36), (4, -0.32), (9.5, -0.1), (10.2, 0.02), (9.4, 0.14), (4, 0.4), (0, 0.42)], 0.26)
        for v in bl.data.vertices:
            if v.co.y * side < 0: v.co.z *= 0.35 if v.co.x > 1 else 1
        bevel(bl, 0.03, 2, 40); smooth(bl, 35); bl.data.materials.append(M['steel'])
        # шейка и кольцо
        shank = extrude('Shank', [(-0.2, -0.28), (-3.2, -0.55 - 0.2 * (side < 0)), (-3.4, -0.2), (-0.2, 0.3)], 0.3)
        bevel(shank, 0.06, 3, 30); smooth(shank, 30); shank.data.materials.append(M['gold'])
        bpy.ops.mesh.primitive_torus_add(major_radius=1.15, minor_radius=0.19, major_segments=64, minor_segments=18)
        ring = bpy.context.active_object; ring.scale = (1.0, 1.25 if side > 0 else 1.0, 1.0); ring.location = (-4.3, -0.5, 0); ring.data.materials.append(M['gold'])
        for p in ring.data.polygons: p.use_smooth = True
        h = group('Half', [bl, shank, ring])
        h.rotation_euler.z = math.radians(open_deg / 2) * side
        if side < 0: h.scale.y = -1
        h.location.z = side * 0.14
        parts.append(h)
        if side > 0:
            # упор для пальца
            tang = extrude('Tang', catmull([(-4.8, 1.2), (-6.2, 1.6), (-7.4, 2.4), (-7.6, 2.8)], 4) + [(-7.3, 2.9), (-6.0, 2.0), (-4.6, 1.5)], 0.22)
            bevel(tang, 0.06, 3, 30); smooth(tang); tang.data.materials.append(M['gold']); tang.parent = h
    screw = lathe('Screw', [(0, -0.45), (0.32, -0.45), (0.36, -0.4), (0.36, 0.4), (0.3, 0.46), (0, 0.48)], 32)
    screw.data.materials.append(M['gold'])
    return group('Scissors', parts + [screw])

def comb(M, length=17):
    spine = extrude('CombSpine', [(0, 0), (length, 0), (length, 1.1), (0, 1.1)], 0.34); bevel(spine, 0.12, 4, 30); smooth(spine)
    teeth = [spine]
    n = 44
    for i in range(n):
        x = 0.4 + i * (length - 0.8) / (n - 1)
        w = 0.16 if i < n / 2 else 0.2
        L = 2.6 - (0.25 if i % 2 else 0)
        t = extrude('Tooth', [(x - w / 2, 0.1), (x + w / 2, 0.1), (x + w / 2.6, -L + 0.08), (x, -L), (x - w / 2.6, -L + 0.08)], 0.28)
        teeth.append(t)
    ob = join(teeth, 'Comb'); bevel(ob, 0.03, 2, 40); smooth(ob); ob.data.materials.append(M['acetate'])
    return ob

def brush(M):
    handle = lathe('BrushHandle', catmull([(0, 0), (1.9, 0), (2.05, 0.15), (1.7, 1.4), (1.45, 2.6), (1.75, 3.4), (1.95, 3.7), (1.9, 3.85), (0, 3.85)], 6), 96)
    handle.data.materials.append(M['ebony'])
    band = lathe('BrushBand', [(0, 3.3), (1.99, 3.3), (2.02, 3.55), (1.99, 3.8), (0, 3.8)], 96); band.data.materials.append(M['gold'])
    knot = lathe('Knot', catmull([(0, 3.8 + 4.6), (1.3, 3.8 + 4.35), (2.35, 3.8 + 3.5), (2.6, 3.8 + 2.2), (2.1, 3.8 + 0.6), (1.75, 3.8), (0, 3.8)], 8), 128)
    for v in knot.data.vertices:
        v.co.z -= 0  # форма узла
    d = knot.modifiers.new('fibre', 'DISPLACE'); tex = bpy.data.textures.new('fib', 'CLOUDS'); tex.noise_scale = 0.08; d.texture = tex; d.strength = 0.18; tex.noise_scale = 0.05
    knot.data.materials.append(M['bristle'])
    return group('Brush', [handle, band, knot])

def jar(M):
    body = lathe('JarBody', catmull([(0, 0), (3.2, 0), (3.4, 0.2), (3.45, 2.4), (3.3, 2.6), (0, 2.6)], 5), 128); body.data.materials.append(M['matte'])
    lid = lathe('JarLid', catmull([(0, 2.55), (3.55, 2.55), (3.62, 2.7), (3.62, 3.55), (3.5, 3.7), (0, 3.72)], 5), 128); lid.data.materials.append(M['gold'])
    return group('Jar', [body, lid])

def bottle(M):
    prof = catmull([(0, 0), (2.1, 0), (2.25, 0.25), (2.25, 6.4), (2.05, 7.0), (0.75, 7.5), (0.7, 8.4)], 5)
    outer = lathe('Bottle', prof + [(0.55, 8.4), (0.55, 7.5), (1.95, 6.9), (2.1, 6.4), (2.1, 0.2), (0, 0.18)], 96); outer.data.materials.append(M['glass'])
    liquid = lathe('Liquid', [(0, 0.2), (2.08, 0.2), (2.08, 5.2), (0, 5.2)], 96); liquid.data.materials.append(M['liquid'])
    cap = lathe('Cap', catmull([(0, 8.1), (0.95, 8.1), (1.0, 8.3), (1.0, 10.1), (0.9, 10.25), (0, 10.3)], 4), 64); cap.data.materials.append(M['matte'])
    ring = lathe('CapRing', [(0, 8.05), (1.02, 8.05), (1.05, 8.3), (1.02, 8.5), (0, 8.5)], 64); ring.data.materials.append(M['gold'])
    return group('BottleSet', [outer, liquid, cap, ring])

def clipper(M):
    body = extrude('ClipBody', catmull([(-2.0, 0), (-2.1, 5), (-1.9, 10), (-1.5, 13.3), (1.5, 13.3), (1.9, 10), (2.1, 5), (2.0, 0), (1.2, -0.5), (-1.2, -0.5)], 4), 3.2)
    bevel(body, 0.9, 6, 30); smooth(body, 30); body.data.materials.append(M['matte'])
    # латунная вставка и кнопка
    plate = extrude('ClipPlate', [(-1.5, 2), (1.5, 2), (1.5, 9), (-1.5, 9)], 0.2); plate.location.z = 1.62; bevel(plate, 0.08, 3); smooth(plate); plate.data.materials.append(M['gold'])
    btn = lathe('Button', [(0, 0), (0.5, 0), (0.55, 0.15), (0.5, 0.3), (0, 0.32)], 32); btn.location = (0, 10.8, 1.55); btn.data.materials.append(M['gold'])
    # ножевой блок: основание + зубья
    head = extrude('Head', [(-1.95, 13.2), (1.95, 13.2), (1.95, 13.9), (-1.95, 13.9)], 2.2); bevel(head, 0.1, 2); smooth(head); head.data.materials.append(M['steel'])
    teeth = []
    for i in range(30):
        x = -1.85 + i * 3.7 / 29
        teeth.append(extrude('T', [(x - 0.05, 13.85), (x + 0.05, 13.85), (x + 0.03, 14.6), (x, 14.65), (x - 0.03, 14.6)], 1.2))
    t = join(teeth, 'Teeth'); t.location.z = 0.3; t.data.materials.append(M['mirror'])
    return group('Clipper', [body, plate, btn, head, t])

# ───────────────────────── сцена, свет, камера
def world_and_render(res, samples=SAMPLES, exposure=0.0):
    sc = bpy.context.scene
    sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'; sc.cycles.samples = samples; sc.cycles.use_denoising = True
    sc.cycles.max_bounces = 8; sc.cycles.transmission_bounces = 8; sc.cycles.glossy_bounces = 6
    sc.render.resolution_x, sc.render.resolution_y = res; sc.render.resolution_percentage = int(os.environ.get('PCT', '100'))
    sc.view_settings.view_transform = 'AgX'; sc.view_settings.look = 'AgX - Punchy'; sc.view_settings.exposure = exposure
    w = bpy.data.worlds.new('W'); w.use_nodes = True
    bg = w.node_tree.nodes['Background']; bg.inputs['Color'].default_value = (0.003, 0.003, 0.003, 1); bg.inputs['Strength'].default_value = 1
    sc.world = w

def floor(M, size=200):
    bpy.ops.mesh.primitive_plane_add(size=size); f = bpy.context.active_object; f.data.materials.append(M['slate']); return f

def backdrop(M):
    """Плавная циклорама: пол переходит в стену — без видимого горизонта"""
    prof = catmull([(-80, 0), (30, 0), (45, 4), (50, 20), (50, 60)], 8)
    bm = bmesh.new()
    rows = []
    for x in (-120, 120):
        rows.append([bm.verts.new((x, y, z)) for y, z in prof])
    for i in range(len(prof) - 1):
        bm.faces.new((rows[0][i], rows[1][i], rows[1][i + 1], rows[0][i + 1]))
    ob = mesh_from_bm('Cyc', bm)
    for p in ob.data.polygons: p.use_smooth = True
    ob.data.materials.append(M['slate']); return ob

def area(name, loc, size, energy, color=(1, 1, 1), target=(0, 0, 0), shape='RECTANGLE'):
    l = bpy.data.lights.new(name, 'AREA'); l.shape = shape
    l.size = size[0]; l.size_y = size[1]; l.energy = energy; l.color = color
    o = link(bpy.data.objects.new(name, l)); o.location = loc
    o.rotation_euler = (Vector(target) - Vector(loc)).to_track_quat('-Z', 'Y').to_euler(); return o

def camera(loc, target, lens=85, fstop=None, focus=None, shift=(0, 0)):
    c = bpy.data.cameras.new('Cam'); c.lens = lens; c.shift_x, c.shift_y = shift
    if fstop:
        c.dof.use_dof = True; c.dof.aperture_fstop = fstop
        c.dof.focus_distance = focus if focus else (Vector(target) - Vector(loc)).length
    o = link(bpy.data.objects.new('Cam', c)); o.location = loc
    o.rotation_euler = (Vector(target) - Vector(loc)).to_track_quat('-Z', 'Y').to_euler()
    bpy.context.scene.camera = o; return o

WARM = (1.0, 0.86, 0.68); COOL = (0.78, 0.84, 1.0)

K = float(os.environ.get('K', '6'))
def rig(key=900, rim=1400, fill=40, rim_pos=((-18, 30, 14), (22, 26, 10)), key_pos=(-14, -10, 26)):
    area('Key', key_pos, (18, 12), key * K, (1, 0.96, 0.9))
    area('RimA', rim_pos[0], (3, 26), rim * K, WARM)
    area('RimB', rim_pos[1], (2, 20), rim * 0.6 * K, WARM)
    area('Fill', (20, -24, 6), (10, 10), fill * K, COOL)
    # большой слабый «потолок»: металл читается как сталь, а не как чёрная дыра
    area('Ceil', (0, 4, 60), (90, 60), float(os.environ.get('CEIL', '260')) * K, (1, 0.97, 0.93))

def place(ob, loc=(0, 0, 0), rot=(0, 0, 0), scale=1.0):
    ob.location = loc; ob.rotation_euler = Euler([math.radians(r) for r in rot]); ob.scale = (scale, scale, scale); return ob

def render(name):
    bpy.context.scene.render.filepath = os.path.join(OUT, name + '.png')
    bpy.ops.render.render(write_still=True)

# ───────────────────────── кадры
def shot(name):
    reset(); M = materials()
    if name == 'glb':
        r = razor(M, 180)
        # бритва для 3D на сайте: центр в оси, без пола
        bpy.ops.object.select_all(action='DESELECT')
        for o in bpy.data.objects: o.select_set(o.type == 'MESH')
        for o in bpy.data.objects:
            if o.type == 'MESH': apply_all(o)
        bpy.ops.export_scene.gltf(filepath=os.path.join(OUT, 'razor.glb'), export_format='GLB', export_yup=True, export_apply=True, use_selection=False, export_cameras=False, export_lights=False)
        return

    if name in ('hero', 'hero_m'):
        backdrop(M); sc_ = scissors(M, 34); place(sc_, (0, 0, 0.35), (0, 0, 142))
        if name == 'hero':
            world_and_render((1920, 1080)); camera((-7, -25, 8.5), (-2.2, 0.8, 0.6), 50, 2.4, (Vector((-9, -24, 8.5)) - Vector((0, 0, 0.4))).length)
        else:
            world_and_render((1080, 1620)); camera((-1, -21, 13), (-0.6, -1.4, 0.4), 50, 2.8, (Vector((-1, -21, 13)) - Vector((0, 0, 0.4))).length)
        rig(900, 2600, fill=15)
    elif name == 'haircut':
        backdrop(M); s = scissors(M, 26); place(s, (0, 0, 0.35), (0, 0, 60))
        world_and_render((1000, 1250)); camera((0, -20, 17), (0, 0.5, 0.3), 80, 3.2); rig(900, 1800)
    elif name == 'beard':
        backdrop(M); r = razor(M, 180); place(r, (-1, 2, 0.45), (0, 0, -62))
        world_and_render((1000, 1250)); camera((2, -20, 24), (0, 0, 0.4), 50, 5); rig(900, 2600, fill=15)
    elif name == 'combo':
        backdrop(M); s = scissors(M, 8); place(s, (0.5, -1, 0.5), (0, 0, 20))
        c = comb(M, 16); place(c, (-7.5, 4, 0.18), (0, 0, 20))
        world_and_render((1000, 1250)); camera((0, -6, 34), (0, 1, 0), 60, 4); rig(900, 1700, key_pos=(-10, -4, 30))
    elif name == 'kids':
        backdrop(M); c = comb(M, 15); place(c, (-7.5, 0, 0.18), (0, 0, 12))
        world_and_render((1000, 1250)); camera((6, -11, 6), (0, 0, 0), 85, 2.2); rig(900, 2400, fill=15)
    elif name == 'royal':
        backdrop(M); bo = bottle(M); place(bo, (-2.5, 3, 0)); j = jar(M); place(j, (3.5, 0, 0))
        world_and_render((1000, 1250)); camera((0, -30, 10), (-1, 1, 4.5), 85, 3.5); rig(1000, 2200)
    elif name == 'clipper':
        backdrop(M); cl = clipper(M); place(cl, (0, -4, 1.62), (0, 0, 28))
        world_and_render((1000, 1250)); camera((0, -14, 24), (0, 1.5, 1.0), 70, 3.2); rig(900, 1900)
    elif name == 'clipper_stand':
        backdrop(M); cl = clipper(M); place(cl, (0, 0, 1.6), (-90, 0, 0)); cl.location = (0, 0, 0.5); cl.rotation_euler = Euler((math.radians(-82), 0, math.radians(8)))
        cl.location.z = 0
        world_and_render((1000, 1250)); camera((0, -26, 8), (0, 0, 7), 85, 3.2); rig(900, 2400)
    elif name == 'razor_macro':
        backdrop(M); r = razor(M, 170); place(r, (0, 0, 0.45), (0, 0, 8))
        world_and_render((1600, 1000)); camera((-3, -9, 3.2), (3, 1.2, 0.8), 100, 1.6, None); rig(1000, 2600)
    elif name == '_unused_brush':
        backdrop(M); b = brush(M); place(b, (0, 0, 0))
        world_and_render((1000, 1250)); camera((0, -20, 6), (0, 0, 4.5), 100, 2.4); rig(900, 2600, fill=20)
    elif name == 'bottle_portrait':
        backdrop(M); bo = bottle(M); place(bo, (0, 0, 0)); j = jar(M); place(j, (4.6, -2.2, 0), (0, 0, 0), 0.8)
        world_and_render((1000, 1250)); camera((0, -22, 7), (1, 0, 4.8), 90, 2.8); rig(900, 2800, fill=20)
    elif name == 'flatlay':
        backdrop(M)
        r = razor(M, 180); place(r, (-2, 5, 0.4), (0, 0, 0), 0.9)
        s = scissors(M, 0); place(s, (-4, -3, 0.35), (0, 0, 0), 0.9)
        c = comb(M, 15); place(c, (-9, -9, 0.18), (0, 0, 0))
        j = jar(M); place(j, (11, -4, 0), (0, 0, 0), 0.9)
        world_and_render((1800, 1125)); camera((0, 0, 60), (0, 0, 0), 50, 8); rig(1400, 1600, key_pos=(-20, 10, 40))
    else:
        raise SystemExit('unknown shot ' + name)
    render(name)

shot(SHOT)
