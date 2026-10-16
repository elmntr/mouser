  414e25:	cc                   	int3
  414e26:	cc                   	int3
  414e27:	cc                   	int3
  414e28:	cc                   	int3
  414e29:	cc                   	int3
  414e2a:	cc                   	int3
  414e2b:	cc                   	int3
  414e2c:	cc                   	int3
  414e2d:	cc                   	int3
  414e2e:	cc                   	int3
  414e2f:	cc                   	int3
  414e30:	55                   	push   ebp
  414e31:	8b ec                	mov    ebp,esp
  414e33:	83 ec 74             	sub    esp,0x74
  414e36:	a1 08 a0 42 00       	mov    eax,ds:0x42a008
  414e3b:	33 c5                	xor    eax,ebp
  414e3d:	89 45 fc             	mov    DWORD PTR [ebp-0x4],eax
  414e40:	53                   	push   ebx
  414e41:	56                   	push   esi
  414e42:	57                   	push   edi
  414e43:	6a 5e                	push   0x5e
  414e45:	8d 45 96             	lea    eax,[ebp-0x6a]
  414e48:	8b f9                	mov    edi,ecx
  414e4a:	6a 00                	push   0x0
  414e4c:	50                   	push   eax
  414e4d:	89 7d 8c             	mov    DWORD PTR [ebp-0x74],edi
  414e50:	e8 be 49 00 00       	call   0x419813
  414e55:	8b 8f 24 87 07 00    	mov    ecx,DWORD PTR [edi+0x78724]
  414e5b:	83 c4 0c             	add    esp,0xc
  414e5e:	66 c7 45 90 04 38    	mov    WORD PTR [ebp-0x70],0x3804
  414e64:	c6 45 92 01          	mov    BYTE PTR [ebp-0x6e],0x1
  414e68:	0f b6 81 44 09 00 00 	movzx  eax,BYTE PTR [ecx+0x944]
  414e6f:	88 45 93             	mov    BYTE PTR [ebp-0x6d],al
  414e72:	0f b6 81 40 09 00 00 	movzx  eax,BYTE PTR [ecx+0x940]
  414e79:	88 45 94             	mov    BYTE PTR [ebp-0x6c],al
  414e7c:	32 c0                	xor    al,al
  414e7e:	83 b9 04 09 00 00 01 	cmp    DWORD PTR [ecx+0x904],0x1
  414e85:	75 06                	jne    0x414e8d
  414e87:	33 c0                	xor    eax,eax
  414e89:	0f ba e8 00          	bts    eax,0x0
  414e8d:	83 b9 08 09 00 00 01 	cmp    DWORD PTR [ecx+0x908],0x1
  414e94:	75 07                	jne    0x414e9d
  414e96:	0f b6 c0             	movzx  eax,al
  414e99:	0f ba e8 01          	bts    eax,0x1
  414e9d:	83 b9 0c 09 00 00 01 	cmp    DWORD PTR [ecx+0x90c],0x1
  414ea4:	75 07                	jne    0x414ead
  414ea6:	0f b6 c0             	movzx  eax,al
  414ea9:	0f ba e8 02          	bts    eax,0x2
  414ead:	83 b9 10 09 00 00 01 	cmp    DWORD PTR [ecx+0x910],0x1
  414eb4:	75 07                	jne    0x414ebd
  414eb6:	0f b6 c0             	movzx  eax,al
  414eb9:	0f ba e8 03          	bts    eax,0x3
  414ebd:	83 b9 14 09 00 00 01 	cmp    DWORD PTR [ecx+0x914],0x1
  414ec4:	75 07                	jne    0x414ecd
  414ec6:	0f b6 c0             	movzx  eax,al
  414ec9:	0f ba e8 04          	bts    eax,0x4
  414ecd:	83 b9 18 09 00 00 01 	cmp    DWORD PTR [ecx+0x918],0x1
  414ed4:	75 07                	jne    0x414edd
  414ed6:	0f b6 c0             	movzx  eax,al
  414ed9:	0f ba e8 05          	bts    eax,0x5
  414edd:	83 b9 1c 09 00 00 01 	cmp    DWORD PTR [ecx+0x91c],0x1
  414ee4:	75 07                	jne    0x414eed
  414ee6:	0f b6 c0             	movzx  eax,al
  414ee9:	0f ba e8 06          	bts    eax,0x6
  414eed:	83 b9 20 09 00 00 01 	cmp    DWORD PTR [ecx+0x920],0x1
  414ef4:	75 07                	jne    0x414efd
  414ef6:	0f b6 c0             	movzx  eax,al
  414ef9:	0f ba e8 07          	bts    eax,0x7
  414efd:	88 45 95             	mov    BYTE PTR [ebp-0x6b],al
  414f00:	33 d2                	xor    edx,edx
  414f02:	b8 c4 08 00 00       	mov    eax,0x8c4
  414f07:	81 3c 01 dc 00 00 00 	cmp    DWORD PTR [ecx+eax*1],0xdc
  414f0e:	7e 04                	jle    0x414f14
  414f10:	b3 01                	mov    bl,0x1
  414f12:	eb 0d                	jmp    0x414f21
  414f14:	3d e4 08 00 00       	cmp    eax,0x8e4
  414f19:	0f 83 81 02 00 00    	jae    0x4151a0
  414f1f:	32 db                	xor    bl,bl
  414f21:	88 5c 15 f4          	mov    BYTE PTR [ebp+edx*1-0xc],bl
  414f25:	83 c0 04             	add    eax,0x4
  414f28:	42                   	inc    edx
  414f29:	3d e4 08 00 00       	cmp    eax,0x8e4
  414f2e:	7c d7                	jl     0x414f07
  414f30:	32 c0                	xor    al,al
  414f32:	80 7d f4 01          	cmp    BYTE PTR [ebp-0xc],0x1
  414f36:	75 06                	jne    0x414f3e
  414f38:	33 c0                	xor    eax,eax
  414f3a:	0f ba e8 00          	bts    eax,0x0
  414f3e:	80 7d f5 01          	cmp    BYTE PTR [ebp-0xb],0x1
  414f42:	75 07                	jne    0x414f4b
  414f44:	0f b6 c0             	movzx  eax,al
  414f47:	0f ba e8 01          	bts    eax,0x1
  414f4b:	80 7d f6 01          	cmp    BYTE PTR [ebp-0xa],0x1
  414f4f:	75 07                	jne    0x414f58
  414f51:	0f b6 c0             	movzx  eax,al
  414f54:	0f ba e8 02          	bts    eax,0x2
  414f58:	80 7d f7 01          	cmp    BYTE PTR [ebp-0x9],0x1
  414f5c:	75 07                	jne    0x414f65
  414f5e:	0f b6 c0             	movzx  eax,al
  414f61:	0f ba e8 03          	bts    eax,0x3
  414f65:	80 7d f8 01          	cmp    BYTE PTR [ebp-0x8],0x1
  414f69:	75 07                	jne    0x414f72
  414f6b:	0f b6 c0             	movzx  eax,al
  414f6e:	0f ba e8 04          	bts    eax,0x4
  414f72:	80 7d f9 01          	cmp    BYTE PTR [ebp-0x7],0x1
  414f76:	75 07                	jne    0x414f7f
  414f78:	0f b6 c0             	movzx  eax,al
  414f7b:	0f ba e8 05          	bts    eax,0x5
  414f7f:	80 7d fa 01          	cmp    BYTE PTR [ebp-0x6],0x1
  414f83:	75 07                	jne    0x414f8c
  414f85:	0f b6 c0             	movzx  eax,al
  414f88:	0f ba e8 06          	bts    eax,0x6
  414f8c:	80 7d fb 01          	cmp    BYTE PTR [ebp-0x5],0x1
  414f90:	75 07                	jne    0x414f99
  414f92:	0f b6 c0             	movzx  eax,al
  414f95:	0f ba e8 07          	bts    eax,0x7
  414f99:	8b 9f 24 87 07 00    	mov    ebx,DWORD PTR [edi+0x78724]
  414f9f:	33 f6                	xor    esi,esi
  414fa1:	88 45 96             	mov    BYTE PTR [ebp-0x6a],al
  414fa4:	88 45 97             	mov    BYTE PTR [ebp-0x69],al
  414fa7:	8d bb c4 08 00 00    	lea    edi,[ebx+0x8c4]
  414fad:	0f 1f 00             	nop    DWORD PTR [eax]
  414fb0:	8b 0f                	mov    ecx,DWORD PTR [edi]
  414fb2:	85 c9                	test   ecx,ecx
  414fb4:	74 2b                	je     0x414fe1
  414fb6:	81 f9 c8 00 00 00    	cmp    ecx,0xc8
  414fbc:	7f 05                	jg     0x414fc3
  414fbe:	6b c1 32             	imul   eax,ecx,0x32
  414fc1:	eb 13                	jmp    0x414fd6
  414fc3:	8d 41 9c             	lea    eax,[ecx-0x64]
  414fc6:	6b c0 64             	imul   eax,eax,0x64
  414fc9:	81 f9 dc 00 00 00    	cmp    ecx,0xdc
  414fcf:	7e 05                	jle    0x414fd6
  414fd1:	99                   	cdq
  414fd2:	2b c2                	sub    eax,edx
  414fd4:	d1 f8                	sar    eax,1
  414fd6:	88 44 35 98          	mov    BYTE PTR [ebp+esi*1-0x68],al
  414fda:	c1 f8 08             	sar    eax,0x8
  414fdd:	88 44 35 a0          	mov    BYTE PTR [ebp+esi*1-0x60],al
  414fe1:	46                   	inc    esi
  414fe2:	83 c7 04             	add    edi,0x4
  414fe5:	83 fe 08             	cmp    esi,0x8
  414fe8:	7c c6                	jl     0x414fb0
  414fea:	0f b6 83 34 09 00 00 	movzx  eax,BYTE PTR [ebx+0x934]
  414ff1:	b9 03 00 00 00       	mov    ecx,0x3
  414ff6:	fe c0                	inc    al
  414ff8:	0f 57 db             	xorps  xmm3,xmm3
  414ffb:	88 45 a8             	mov    BYTE PTR [ebp-0x58],al
  414ffe:	0f 57 d2             	xorps  xmm2,xmm2
  415001:	0f b6 83 60 09 00 00 	movzx  eax,BYTE PTR [ebx+0x960]
  415008:	88 45 a9             	mov    BYTE PTR [ebp-0x57],al
  41500b:	0f b6 83 61 09 00 00 	movzx  eax,BYTE PTR [ebx+0x961]
  415012:	88 45 aa             	mov    BYTE PTR [ebp-0x56],al
  415015:	0f b6 83 62 09 00 00 	movzx  eax,BYTE PTR [ebx+0x962]
  41501c:	88 45 ab             	mov    BYTE PTR [ebp-0x55],al
  41501f:	0f b6 83 64 09 00 00 	movzx  eax,BYTE PTR [ebx+0x964]
  415026:	88 45 ac             	mov    BYTE PTR [ebp-0x54],al
  415029:	0f b6 83 65 09 00 00 	movzx  eax,BYTE PTR [ebx+0x965]
  415030:	88 45 ad             	mov    BYTE PTR [ebp-0x53],al
  415033:	0f b6 83 66 09 00 00 	movzx  eax,BYTE PTR [ebx+0x966]
  41503a:	88 45 ae             	mov    BYTE PTR [ebp-0x52],al
  41503d:	0f b6 83 68 09 00 00 	movzx  eax,BYTE PTR [ebx+0x968]
  415044:	88 45 af             	mov    BYTE PTR [ebp-0x51],al
  415047:	0f b6 83 69 09 00 00 	movzx  eax,BYTE PTR [ebx+0x969]
  41504e:	88 45 b0             	mov    BYTE PTR [ebp-0x50],al
  415051:	0f b6 83 6a 09 00 00 	movzx  eax,BYTE PTR [ebx+0x96a]
  415058:	88 45 b1             	mov    BYTE PTR [ebp-0x4f],al
  41505b:	0f b6 83 6c 09 00 00 	movzx  eax,BYTE PTR [ebx+0x96c]
  415062:	88 45 b2             	mov    BYTE PTR [ebp-0x4e],al
  415065:	0f b6 83 6d 09 00 00 	movzx  eax,BYTE PTR [ebx+0x96d]
  41506c:	88 45 b3             	mov    BYTE PTR [ebp-0x4d],al
  41506f:	0f b6 83 6e 09 00 00 	movzx  eax,BYTE PTR [ebx+0x96e]
  415076:	88 45 b4             	mov    BYTE PTR [ebp-0x4c],al
  415079:	0f b6 83 70 09 00 00 	movzx  eax,BYTE PTR [ebx+0x970]
  415080:	88 45 b5             	mov    BYTE PTR [ebp-0x4b],al
  415083:	0f b6 83 71 09 00 00 	movzx  eax,BYTE PTR [ebx+0x971]
  41508a:	88 45 b6             	mov    BYTE PTR [ebp-0x4a],al
  41508d:	0f b6 83 72 09 00 00 	movzx  eax,BYTE PTR [ebx+0x972]
  415094:	88 45 b7             	mov    BYTE PTR [ebp-0x49],al
  415097:	0f b6 83 74 09 00 00 	movzx  eax,BYTE PTR [ebx+0x974]
  41509e:	88 45 b8             	mov    BYTE PTR [ebp-0x48],al
  4150a1:	0f b6 83 75 09 00 00 	movzx  eax,BYTE PTR [ebx+0x975]
  4150a8:	88 45 b9             	mov    BYTE PTR [ebp-0x47],al
  4150ab:	0f b6 83 76 09 00 00 	movzx  eax,BYTE PTR [ebx+0x976]
  4150b2:	88 45 ba             	mov    BYTE PTR [ebp-0x46],al
  4150b5:	0f b6 83 78 09 00 00 	movzx  eax,BYTE PTR [ebx+0x978]
  4150bc:	88 45 bb             	mov    BYTE PTR [ebp-0x45],al
  4150bf:	0f b6 83 79 09 00 00 	movzx  eax,BYTE PTR [ebx+0x979]
  4150c6:	88 45 bc             	mov    BYTE PTR [ebp-0x44],al
  4150c9:	0f b6 83 7a 09 00 00 	movzx  eax,BYTE PTR [ebx+0x97a]
  4150d0:	88 45 bd             	mov    BYTE PTR [ebp-0x43],al
  4150d3:	0f b6 83 7c 09 00 00 	movzx  eax,BYTE PTR [ebx+0x97c]
  4150da:	88 45 be             	mov    BYTE PTR [ebp-0x42],al
  4150dd:	0f b6 83 7d 09 00 00 	movzx  eax,BYTE PTR [ebx+0x97d]
  4150e4:	5f                   	pop    edi
  4150e5:	88 45 bf             	mov    BYTE PTR [ebp-0x41],al
  4150e8:	0f b6 83 7e 09 00 00 	movzx  eax,BYTE PTR [ebx+0x97e]
  4150ef:	5e                   	pop    esi
  4150f0:	88 45 c0             	mov    BYTE PTR [ebp-0x40],al
  4150f3:	c6 45 c1 01          	mov    BYTE PTR [ebp-0x3f],0x1
  4150f7:	5b                   	pop    ebx
  4150f8:	0f 1f 84 00 00 00 00 	nop    DWORD PTR [eax+eax*1+0x0]
  4150ff:	00 
  415100:	f3 0f 7e 4c 0d 90    	movq   xmm1,QWORD PTR [ebp+ecx*1-0x70]
  415106:	0f 57 c0             	xorps  xmm0,xmm0
  415109:	66 0f 60 c8          	punpcklbw xmm1,xmm0
  41510d:	66 0f fd d9          	paddw  xmm3,xmm1
  415111:	f3 0f 7e 4c 0d 98    	movq   xmm1,QWORD PTR [ebp+ecx*1-0x68]
  415117:	83 c1 10             	add    ecx,0x10
  41511a:	66 0f 60 c8          	punpcklbw xmm1,xmm0
  41511e:	66 0f fd d1          	paddw  xmm2,xmm1
  415122:	83 f9 23             	cmp    ecx,0x23
  415125:	7c d9                	jl     0x415100
  415127:	66 0f fd d3          	paddw  xmm2,xmm3
  41512b:	0f 28 c2             	movaps xmm0,xmm2
  41512e:	66 0f 73 d8 08       	psrldq xmm0,0x8
  415133:	66 0f fd d0          	paddw  xmm2,xmm0
  415137:	0f 10 c2             	movups xmm0,xmm2
  41513a:	66 0f 73 d8 04       	psrldq xmm0,0x4
  41513f:	66 0f fd d0          	paddw  xmm2,xmm0
  415143:	0f 10 c2             	movups xmm0,xmm2
  415146:	66 0f 73 d8 02       	psrldq xmm0,0x2
  41514b:	66 0f fd d0          	paddw  xmm2,xmm0
  41514f:	66 0f 7e d0          	movd   eax,xmm2
  415153:	0f b7 c0             	movzx  eax,ax
  415156:	89 45 f8             	mov    DWORD PTR [ebp-0x8],eax
  415159:	83 f9 32             	cmp    ecx,0x32
  41515c:	7d 18                	jge    0x415176
  41515e:	66 8b d0             	mov    dx,ax
  415161:	0f b6 44 0d 90       	movzx  eax,BYTE PTR [ebp+ecx*1-0x70]
  415166:	41                   	inc    ecx
  415167:	66 03 d0             	add    dx,ax
  41516a:	83 f9 32             	cmp    ecx,0x32
  41516d:	7c f2                	jl     0x415161
  41516f:	66 89 55 f8          	mov    WORD PTR [ebp-0x8],dx
  415173:	8b 45 f8             	mov    eax,DWORD PTR [ebp-0x8]
  415176:	8b 4d 8c             	mov    ecx,DWORD PTR [ebp-0x74]
  415179:	c1 e8 08             	shr    eax,0x8
  41517c:	88 45 c2             	mov    BYTE PTR [ebp-0x3e],al
  41517f:	8a 45 f8             	mov    al,BYTE PTR [ebp-0x8]
  415182:	88 45 c3             	mov    BYTE PTR [ebp-0x3d],al
  415185:	8d 45 90             	lea    eax,[ebp-0x70]
  415188:	6a 38                	push   0x38
  41518a:	50                   	push   eax
  41518b:	e8 00 f2 ff ff       	call   0x414390
  415190:	8b 4d fc             	mov    ecx,DWORD PTR [ebp-0x4]
  415193:	33 cd                	xor    ecx,ebp
  415195:	e8 35 38 00 00       	call   0x4189cf
  41519a:	8b e5                	mov    esp,ebp
  41519c:	5d                   	pop    ebp
  41519d:	c2 04 00             	ret    0x4
  4151a0:	e8 2f 3d 00 00       	call   0x418ed4
  4151a5:	cc                   	int3
  4151a6:	cc                   	int3
  4151a7:	cc                   	int3
  4151a8:	cc                   	int3
